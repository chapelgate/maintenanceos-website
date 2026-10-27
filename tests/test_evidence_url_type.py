import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

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


def test_evidence_url_input_uses_url_type(test_database, monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    work_order_id, contractor_id = seed_dispatch(test_database)
    with test_database() as session:
        session.query(WorkOrder).filter_by(id=work_order_id).update(
            {"status": "APPOINTMENT_BOOKED"}, synchronize_session=False
        )
        session.commit()
    html = api.complete_form(work_order_id, contractor_id, sign_link("complete", work_order_id, contractor_id))
    assert 'id="evidence_url" name="evidence_url" type="url"' in html
    assert f'maxlength="{api.EVIDENCE_URL_MAX}"' in html
