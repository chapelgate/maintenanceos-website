import json

import pytest
from fastapi import HTTPException,Request
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import api
import channels
import decision_engine
import operations
from models import (
    Approval,
    AutomationJob,
    Base,
    Client,
    Contractor,
    Property,
    Resident,
    TenantBoundary,
    WorkOrder,
)
from security import sign_link


@pytest.fixture
def test_database(monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    testing_session=sessionmaker(bind=engine,expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (api,channels,decision_engine,operations):
        monkeypatch.setattr(module,"SessionLocal",testing_session)
    monkeypatch.setenv('ENABLE_CONTRACTOR_PORTAL', 'true')
    return testing_session


def make_request(token=""):
    headers=[]
    if token:
        headers.append((b"authorization",f"Bearer {token}".encode()))
    return Request({"type":"http","method":"GET","path":"/readiness","headers":headers})


def test_internal_api_fails_closed(monkeypatch,test_database):
    monkeypatch.delenv("INTERNAL_API_TOKEN",raising=False)
    with pytest.raises(HTTPException) as missing:
        api.require_internal_api(make_request())
    assert missing.value.status_code==503

    token="i"*32
    monkeypatch.setenv("INTERNAL_API_TOKEN",token)
    with pytest.raises(HTTPException) as wrong:
        api.require_internal_api(make_request("wrong"))
    assert wrong.value.status_code==401
    with test_database() as session:
        client=Client(name="Bound API tenant");session.add(client);session.flush();client_id=client.id
        session.add(TenantBoundary(client_id=client_id,mode="SYNTHETIC_TEST",label="API test"));session.commit()
    monkeypatch.setenv("VOICE_TENANT_MODE","isolated_test")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID",str(client_id))
    monkeypatch.setenv("INTERNAL_API_CLIENT_ID",str(client_id))
    request=make_request(token)
    assert api.require_internal_api(request)==client_id
    assert request.state.client_id==client_id


def seed_dispatch(session_factory,safety_flags="[]"):
    with session_factory() as session:
        client=Client(name="Pilot client")
        session.add(client);session.flush()
        prop=Property(client_id=client.id,address="Private address",postcode="SW1A 1AA")
        contractor=Contractor(
            client_id=client.id,name="Approved contractor",trade="Plumber",active=True,
            postcode_coverage="SW1A",qualification_summary="SYNTHETIC TEST",
            qualification_expiry="2099-12-31",insurance_expiry="2099-12-31",
        )
        session.add_all([prop,contractor]);session.flush()
        work_order=WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            description="Tap leak",
            category="Plumbing",
            trade="Plumber",
            urgency="P3",
            status="AWAITING_CONTRACTOR",
            safety_flags=safety_flags,
            ai_confidence=.8,
            assigned_contractor_id=contractor.id,
        )
        session.add(work_order);session.flush()
        session.add(Approval(
            client_id=client.id,
            work_order_id=work_order.id,
            approval_type="DISPATCH",
            proposed_action="Dispatch",
            reason="Approved test",
            status="APPROVED",
        ))
        session.commit()
        return work_order.id,contractor.id


def configure_internal_api(monkeypatch,session_factory):
    token="i"*32
    with session_factory() as session:
        client=Client(name="Synthetic HTTP tenant");session.add(client);session.flush()
        session.add(TenantBoundary(client_id=client.id,mode="SYNTHETIC_TEST",label="HTTP"));session.commit();client_id=client.id
    monkeypatch.setenv("INTERNAL_API_TOKEN",token)
    monkeypatch.setenv("INTERNAL_API_CLIENT_ID",str(client_id))
    monkeypatch.setenv("VOICE_TENANT_MODE","isolated_test")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID",str(client_id))
    return client_id,{"Authorization":f"Bearer {token}"}


def test_safety_case_cannot_use_contractor_accept_link(test_database,monkeypatch):
    monkeypatch.setenv("APP_SECRET","s"*32)
    work_order_id,contractor_id=seed_dispatch(
        test_database,
        json.dumps([{"code":"GAS_SMELL","level":"RED"}]),
    )
    token=sign_link("accept",work_order_id,contractor_id)
    with pytest.raises(HTTPException) as blocked:
        api.contractor_decision_submit(work_order_id,contractor_id,"accept",token)
    assert blocked.value.status_code==409
    with test_database() as session:
        work_order=session.query(WorkOrder).filter_by(id=work_order_id).one()
        assert work_order.status=="AWAITING_CONTRACTOR"
        assert session.query(AutomationJob).count()==0


def test_duplicate_contractor_accept_is_rejected(test_database,monkeypatch):
    monkeypatch.setenv("APP_SECRET","s"*32)
    work_order_id,contractor_id=seed_dispatch(test_database)
    token=sign_link("accept",work_order_id,contractor_id)
    preview=api.contractor_decision(work_order_id,contractor_id,"accept",token)
    assert "Confirm action" in preview
    with test_database() as session:
        assert session.get(WorkOrder,work_order_id).status=="AWAITING_CONTRACTOR"
    assert "Job accepted" in api.contractor_decision_submit(work_order_id,contractor_id,"accept",token)
    with pytest.raises(HTTPException) as replay:
        api.contractor_decision_submit(work_order_id,contractor_id,"accept",token)
    assert replay.value.status_code==409
    with test_database() as session:
        work_order=session.query(WorkOrder).filter_by(id=work_order_id).one()
        assert work_order.status=="CONTRACTOR_ACCEPTED"
        assert session.query(AutomationJob).count()==1


def test_contractor_links_require_approved_dispatch(test_database,monkeypatch):
    monkeypatch.setenv("APP_SECRET","s"*32)
    monkeypatch.setenv("PUBLIC_BASE_URL","https://pilot.example.com")
    work_order_id,contractor_id=seed_dispatch(test_database)
    with test_database() as session:
        approval=session.query(Approval).filter_by(work_order_id=work_order_id).one()
        approval.status="PENDING"
        session.commit()
    assert operations.contractor_portal_links(work_order_id)=={}
    with test_database() as session:
        approval=session.query(Approval).filter_by(work_order_id=work_order_id).one()
        approval.status="APPROVED"
        session.commit()
    links=operations.contractor_portal_links(work_order_id)
    assert set(links)=={"accept","decline","availability","complete"}
    assert f"contractor_id={contractor_id}" in links["accept"]


def test_caller_id_match_does_not_verify_identity_or_dispatch(test_database):
    with test_database() as session:
        client=Client(name="Pilot client")
        session.add(client);session.flush()
        prop=Property(client_id=client.id,address="Private address",postcode="SW1A 1AA")
        session.add(prop);session.flush()
        resident=Resident(
            client_id=client.id,
            property_id=prop.id,
            name="Resident",
            phone="+440000000000",
            email="resident@example.com",
        )
        session.add(resident);session.commit()
        resident_id=resident.id
        client_id=client.id
        property_id=prop.id

    work_order_id=channels.create_from_channel(
        client_id,
        property_id,
        resident_id,
        "VOICE",
        "The bathroom tap is dripping slowly",
        participant="+440000000000",
        identity_verified=False,
    )
    with test_database() as session:
        work_order=session.query(WorkOrder).filter_by(id=work_order_id).one()
        approvals=session.query(Approval).filter_by(work_order_id=work_order_id).all()
        assert work_order.status=="HUMAN_REVIEW"
        assert work_order.assigned_contractor_id is None
        assert {approval.approval_type for approval in approvals}=={"IDENTITY"}


def test_http_boundary_rejects_malformed_and_weakly_typed_input(test_database,monkeypatch):
    client_id,headers=configure_internal_api(monkeypatch,test_database)
    client=TestClient(api.app)
    malformed=client.post("/work-orders",content="[",headers={**headers,"Content-Type":"application/json"})
    assert malformed.status_code==400
    wrong_shape=client.post("/work-orders",json=[],headers=headers)
    assert wrong_shape.status_code==400
    weak_boolean=client.post("/work-orders",json={
        "property_id":1,"description":"Synthetic tap","identity_verified":"false",
    },headers=headers)
    assert weak_boolean.status_code==400
    confirmation=client.post("/resident-confirmation",json={
        "work_order_id":1,"resolved":"false",
    },headers=headers)
    assert confirmation.status_code==400
    invalid_amount=client.post("/quotes",json={
        "work_order_id":1,"contractor_id":1,"amount":-1,
    },headers=headers)
    assert invalid_amount.status_code==400
    assert client_id>0


def test_http_boundary_limits_request_size_and_sets_security_headers(test_database,monkeypatch):
    _client_id,headers=configure_internal_api(monkeypatch,test_database)
    client=TestClient(api.app)
    oversized=client.post("/work-orders",content="x"*(api.MAX_REQUEST_BYTES+1),headers=headers)
    assert oversized.status_code==413
    health=client.get("/health")
    assert health.status_code==200
    assert health.headers["x-content-type-options"]=="nosniff"
    assert health.headers["x-frame-options"]=="DENY"
    assert health.headers["cache-control"]=="no-store"
