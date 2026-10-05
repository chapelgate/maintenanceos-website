from datetime import date, datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from awaab_policy import HazardCategory, Jurisdiction, Tenure
from awaab_runtime import (
    AwaabRuntimeError,
    clear_case,
    create_awaab_case,
    record_investigation_outcome,
)
from models import AwaabCase, Base, Client, Property, User, WorkOrder


PHASE1 = datetime(2026, 10, 5, 9, 0, 0)
PHASE2 = datetime(2026, 12, 1, 9, 0, 0)


@pytest.fixture
def db():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    with factory() as session:
        a = Client(name="A")
        b = Client(name="B")
        session.add_all([a, b]); session.flush()
        pa = Property(client_id=a.id, address="A", postcode="AA1 1AA")
        pb = Property(client_id=b.id, address="B", postcode="BB1 1BB")
        session.add_all([pa, pb]); session.flush()
        wa = WorkOrder(client_id=a.id, property_id=pa.id, description="damp")
        wb = WorkOrder(client_id=b.id, property_id=pb.id, description="other")
        manager = User(client_id=a.id, email="manager@example.test", password_hash="", role="manager", active=True)
        viewer = User(client_id=a.id, email="viewer@example.test", password_hash="", role="viewer", active=True)
        session.add_all([wa, wb, manager, viewer]); session.commit()
        ids = {"a": a.id, "b": b.id, "wa": wa.id, "wb": wb.id, "manager": manager.id, "viewer": viewer.id}
    yield factory, ids
    engine.dispose()


def create_phase1(session, ids, **changes):
    values = dict(
        client_id=ids["a"],
        work_order_id=ids["wa"],
        jurisdiction=Jurisdiction.ENGLAND,
        tenure=Tenure.SOCIAL_RENTED,
        hazard_category=HazardCategory.DAMP_MOULD,
        case_kind="SIGNIFICANT",
        trigger_at=PHASE1,
        evidence_reference="report:1",
        resident_circumstance_reviewed=True,
        non_working_dates=frozenset(),
    )
    values.update(changes)
    return create_awaab_case(session, **values)


def test_scope_requires_explicit_england_social_rented_case(db):
    factory, ids = db
    with factory() as session:
        with pytest.raises(AwaabRuntimeError, match="out_of_scope"):
            create_phase1(session, ids, jurisdiction=Jurisdiction.OTHER)
        with pytest.raises(AwaabRuntimeError, match="out_of_scope"):
            create_phase1(session, ids, tenure=Tenure.OTHER)


def test_phase_scope_is_date_and_hazard_aware(db):
    factory, ids = db
    with factory() as session:
        case = create_phase1(session, ids)
        assert case.phase == "PHASE_1"
        with pytest.raises(AwaabRuntimeError, match="significant_hazard_out_of_scope_for_phase"):
            create_phase1(session, ids, hazard_category=HazardCategory.ELECTRICAL)

        phase2 = create_phase1(
            session,
            ids,
            trigger_at=PHASE2,
            hazard_category=HazardCategory.ELECTRICAL,
            evidence_reference="report:2",
        )
        assert phase2.phase == "PHASE_2"


def test_significant_case_persists_investigation_and_safety_clocks(db):
    factory, ids = db
    with factory() as session:
        case = create_phase1(session, ids)
        session.flush()
        assert "standard_investigation" in case.deadlines_json
        updated = record_investigation_outcome(
            session,
            case_id=case.id,
            client_id=ids["a"],
            completed_at=datetime(2026, 10, 6, 12, 0, 0),
            relevant_safety_work_identified=True,
            can_make_safe_within_initial_period=False,
            evidence_reference="inspection:1",
            non_working_dates=frozenset(),
        )
        assert "written_summary" in updated.deadlines_json
        assert "significant_safety_work" in updated.deadlines_json
        assert updated.alternative_accommodation_required is True


def test_emergency_case_has_24_hour_clock(db):
    factory, ids = db
    with factory() as session:
        case = create_phase1(
            session,
            ids,
            hazard_category=HazardCategory.FIRE_EXPLOSIONS,
            case_kind="EMERGENCY",
        )
        assert "emergency_investigation" in case.deadlines_json
        assert "2026-10-06T09:00:00" in case.deadlines_json


def test_working_day_clock_uses_explicit_non_working_calendar(db):
    factory, ids = db
    with factory() as session:
        case = create_phase1(
            session,
            ids,
            trigger_at=datetime(2026, 12, 18, 9, 0, 0),
            evidence_reference="holiday:1",
            non_working_dates=frozenset({date(2026, 12, 25), date(2026, 12, 28)}),
        )
        assert "2027-01-05T23:59:59.999999" in case.deadlines_json


def test_cross_tenant_access_is_rejected(db):
    factory, ids = db
    with factory() as session:
        case = create_phase1(session, ids)
        session.flush()
        with pytest.raises(AwaabRuntimeError, match="case_not_found_for_tenant"):
            record_investigation_outcome(
                session,
                case_id=case.id,
                client_id=ids["b"],
                completed_at=datetime(2026, 10, 6, 12, 0, 0),
                relevant_safety_work_identified=True,
                can_make_safe_within_initial_period=True,
                evidence_reference="x",
                non_working_dates=frozenset(),
            )


def test_only_authorised_human_can_clear_case(db):
    factory, ids = db
    with factory() as session:
        case = create_phase1(session, ids)
        session.flush()
        with pytest.raises(AwaabRuntimeError, match="authorised_human_required"):
            clear_case(
                session,
                case_id=case.id,
                client_id=ids["a"],
                actor_user_id=ids["viewer"],
                reason="Reviewed and safe",
                evidence_reference="review:bad",
            )
        cleared = clear_case(
            session,
            case_id=case.id,
            client_id=ids["a"],
            actor_user_id=ids["manager"],
            reason="Reviewed by manager and remediation evidence accepted",
            evidence_reference="review:good",
        )
        assert cleared.status == "CLEARED"
        assert cleared.review_state == "HUMAN_AUTHORISED"
        assert cleared.cleared_by_user_id == ids["manager"]


def test_case_requires_evidence_reference_and_tenant_bound_work_order(db):
    factory, ids = db
    with factory() as session:
        with pytest.raises(AwaabRuntimeError, match="evidence_reference_required"):
            create_phase1(session, ids, evidence_reference="")
        with pytest.raises(AwaabRuntimeError, match="tenant_bound_work_order_required"):
            create_phase1(session, ids, work_order_id=ids["wb"])
