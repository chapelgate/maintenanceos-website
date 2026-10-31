import inspect

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import pytest

import api
import channels
import decision_engine
import operations
from models import Approval, Base, Client, Contractor, Property, WorkOrder
from security import sign_link


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


def test_portal_page_has_skip_to_content():
    source = inspect.getsource(api._portal_page)
    assert 'href="#main-content"' in source or 'href=\\"#main-content\\"' in source
    assert "Skip to content" in source


def test_portal_page_has_main_element():
    source = inspect.getsource(api._portal_page)
    assert "<main" in source
    assert 'id="main-content"' in source or 'id=\\"main-content\\"' in source


def test_portal_page_has_lang_attribute():
    source = inspect.getsource(api._portal_page)
    assert 'lang="en-GB"' in source or 'lang=\\"en-GB\\"' in source


def test_portal_page_has_meta_viewport():
    source = inspect.getsource(api._portal_page)
    assert "viewport" in source


def test_portal_form_inputs_have_labels(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    with test_database() as session:
        session.get(WorkOrder, work_order_id).status = "CONTRACTOR_ACCEPTED"
        session.commit()
    html = api.availability_form(
        work_order_id, contractor_id, sign_link("availability", work_order_id, contractor_id)
    )
    assert 'for="start"' in html and 'id="start"' in html
    assert 'for="end"' in html and 'id="end"' in html


def test_portal_form_has_required_attributes(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    with test_database() as session:
        session.get(WorkOrder, work_order_id).status = "CONTRACTOR_ACCEPTED"
        session.commit()
    html = api.availability_form(
        work_order_id, contractor_id, sign_link("availability", work_order_id, contractor_id)
    )
    assert "required" in html


def test_portal_inputs_have_maxlength(test_database):
    work_order_id, contractor_id = seed_dispatch(test_database)
    html = api.contractor_decision(
        work_order_id, contractor_id, "accept", sign_link("accept", work_order_id, contractor_id)
    )
    assert "maxlength=" in html


def test_error_response_has_no_secret_leakage():
    client = TestClient(api.app)
    response = client.get("/contractor/decision")
    assert "sk-" not in response.text
    assert "Bearer " not in response.text


def test_no_server_header_on_responses():
    response = TestClient(api.app).get("/health")
    assert "server" not in {k.lower() for k in response.headers.keys()} or response.headers.get("server") in (None, "")


def test_cache_control_no_store_on_health():
    assert TestClient(api.app).get("/health").headers.get("cache-control") == "no-store"


def test_referrer_policy_no_referrer_on_health():
    assert TestClient(api.app).get("/health").headers.get("referrer-policy") == "no-referrer"


def test_x_frame_options_deny_on_health():
    assert TestClient(api.app).get("/health").headers.get("x-frame-options") == "DENY"


def test_x_content_type_options_nosniff_on_health():
    assert TestClient(api.app).get("/health").headers.get("x-content-type-options") == "nosniff"
