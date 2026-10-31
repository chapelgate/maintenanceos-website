import re

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import api
import channels
import decision_engine
import operations
from models import Approval, Base, Client, Contractor, Property, WorkOrder
from security import (
    CSRF_TOKEN_MAX,
    issue_form_csrf,
    issue_health_csrf,
    sign_link,
    verify_form_csrf,
    verify_health_csrf,
)


@pytest.fixture
def test_database(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    testing_session = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (api, channels, decision_engine, operations):
        monkeypatch.setattr(module, "SessionLocal", testing_session)
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    return testing_session


def seed_dispatch(session_factory):
    with session_factory() as session:
        client = Client(name="Pilot client")
        session.add(client)
        session.flush()
        prop = Property(client_id=client.id, address="Private address", postcode="SW1A 1AA")
        contractor = Contractor(
            client_id=client.id,
            name="Approved contractor",
            trade="Plumber",
            active=True,
            postcode_coverage="SW1A",
            qualification_summary="SYNTHETIC TEST",
            qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31",
        )
        session.add_all([prop, contractor])
        session.flush()
        work_order = WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            description="Tap leak",
            category="Plumbing",
            trade="Plumber",
            urgency="P3",
            status="AWAITING_CONTRACTOR",
            safety_flags="[]",
            ai_confidence=0.8,
            assigned_contractor_id=contractor.id,
        )
        session.add(work_order)
        session.flush()
        session.add(
            Approval(
                client_id=client.id,
                work_order_id=work_order.id,
                approval_type="DISPATCH",
                proposed_action="Dispatch",
                reason="Approved test",
                status="APPROVED",
            )
        )
        session.commit()
        return work_order.id, contractor.id


def test_csrf_token_added_to_health_response(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    token = response.headers.get("x-csrf-token")
    assert token
    assert len(token) <= CSRF_TOKEN_MAX
    assert verify_health_csrf(token) is True


def test_issue_form_csrf_is_stable_for_same_inputs(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    a = issue_form_csrf(1, 2, "decision")
    b = issue_form_csrf(1, 2, "decision")
    assert a == b
    assert a != issue_form_csrf(1, 3, "decision")
    assert a != issue_form_csrf(1, 2, "availability")


def test_verify_form_csrf_rejects_empty_and_wrong(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    good = issue_form_csrf(9, 8, "complete")
    assert verify_form_csrf(9, 8, "complete", good) is True
    assert verify_form_csrf(9, 8, "complete", "") is False
    assert verify_form_csrf(9, 8, "complete", None) is False
    assert verify_form_csrf(9, 8, "complete", good + "x") is False
    assert verify_form_csrf(9, 8, "complete", "x" * (CSRF_TOKEN_MAX + 1)) is False


def test_decision_form_embeds_csrf_token(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    token = sign_link("accept", work_order_id, contractor_id)
    html = api.contractor_decision(work_order_id, contractor_id, "accept", token)
    match = re.search(r'name="csrf_token" value="([^"]+)"', html)
    assert match
    assert verify_form_csrf(work_order_id, contractor_id, "decision", match.group(1))


def test_availability_and_complete_forms_embed_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    with test_database() as session:
        session.get(WorkOrder, work_order_id).status = "CONTRACTOR_ACCEPTED"
        session.commit()
    avail = api.availability_form(
        work_order_id, contractor_id, sign_link("availability", work_order_id, contractor_id)
    )
    assert verify_form_csrf(
        work_order_id,
        contractor_id,
        "availability",
        re.search(r'name="csrf_token" value="([^"]+)"', avail).group(1),
    )
    with test_database() as session:
        session.query(WorkOrder).filter_by(id=work_order_id).update(
            {"status": "APPOINTMENT_BOOKED"}, synchronize_session=False
        )
        session.commit()
    complete = api.complete_form(
        work_order_id, contractor_id, sign_link("complete", work_order_id, contractor_id)
    )
    assert verify_form_csrf(
        work_order_id,
        contractor_id,
        "complete",
        re.search(r'name="csrf_token" value="([^"]+)"', complete).group(1),
    )


def test_decision_submit_rejects_missing_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    link = sign_link("accept", work_order_id, contractor_id)
    client = TestClient(api.app)
    response = client.post(
        "/contractor/decision",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "decision": "accept",
            "token": link,
        },
    )
    assert response.status_code == 422


def test_decision_submit_rejects_invalid_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    link = sign_link("accept", work_order_id, contractor_id)
    client = TestClient(api.app)
    response = client.post(
        "/contractor/decision",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "decision": "accept",
            "token": link,
            "csrf_token": "not-a-real-csrf-token",
        },
    )
    assert response.status_code == 403
    assert "CSRF" in response.text


def test_decision_submit_accepts_valid_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    link = sign_link("accept", work_order_id, contractor_id)
    csrf = issue_form_csrf(work_order_id, contractor_id, "decision")
    client = TestClient(api.app)
    response = client.post(
        "/contractor/decision",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "decision": "accept",
            "token": link,
            "csrf_token": csrf,
        },
    )
    assert response.status_code == 200
    assert "accepted" in response.text.casefold()


def test_csrf_protection_works_with_exempt_endpoints(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    client = TestClient(api.app)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.headers.get("x-csrf-token")
    # Internal JSON APIs remain bearer-gated, not CSRF-gated on missing form field.
    response = client.post("/quotes", json={})
    assert response.status_code in {401, 403, 422, 503}


def test_health_csrf_rejects_tamper(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    token = issue_health_csrf()
    assert verify_health_csrf(token) is True
    assert verify_health_csrf(token + "z") is False
    assert verify_health_csrf("") is False


def _set_work_order_status(session_factory, work_order_id, status):
    with session_factory() as session:
        session.query(WorkOrder).filter_by(id=work_order_id).update(
            {"status": status}, synchronize_session=False
        )
        session.commit()


def test_availability_submit_rejects_missing_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    _set_work_order_status(test_database, work_order_id, "CONTRACTOR_ACCEPTED")
    link = sign_link("availability", work_order_id, contractor_id)
    client = TestClient(api.app)
    response = client.post(
        "/contractor/availability",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "token": link,
            "start": "2099-01-02T15:30",
            "end": "2099-01-02T16:30",
        },
    )
    assert response.status_code == 422


def test_availability_submit_rejects_invalid_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    _set_work_order_status(test_database, work_order_id, "CONTRACTOR_ACCEPTED")
    link = sign_link("availability", work_order_id, contractor_id)
    client = TestClient(api.app)
    response = client.post(
        "/contractor/availability",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "token": link,
            "csrf_token": "not-a-real-csrf-token",
            "start": "2099-01-02T15:30",
            "end": "2099-01-02T16:30",
        },
    )
    assert response.status_code == 403
    assert "CSRF" in response.text


def test_complete_submit_rejects_missing_and_invalid_csrf(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    _set_work_order_status(test_database, work_order_id, "APPOINTMENT_BOOKED")
    link = sign_link("complete", work_order_id, contractor_id)
    client = TestClient(api.app)
    missing = client.post(
        "/contractor/complete",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "token": link,
            "note": "Done",
        },
    )
    assert missing.status_code == 422
    invalid = client.post(
        "/contractor/complete",
        data={
            "work_order_id": str(work_order_id),
            "contractor_id": str(contractor_id),
            "token": link,
            "csrf_token": "not-a-real-csrf-token",
            "note": "Done",
        },
    )
    assert invalid.status_code == 403
    assert "CSRF" in invalid.text
