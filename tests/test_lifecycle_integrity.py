from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import channels
import decision_engine
import operations
from lifecycle import transition_work_order
from models import (
    Approval,
    AuditEvent,
    Base,
    Client,
    Contractor,
    CriticalSafetyState,
    Escalation,
    Property,
    Resident,
    User,
    WorkOrder,
    WorkOrderStateError,
)
from safety_controls import clear_critical_safety, critical_safety_active


@pytest.fixture
def lifecycle_db(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (channels, decision_engine, operations):
        monkeypatch.setattr(module, "SessionLocal", factory)
    with factory() as session:
        client = Client(name="Synthetic lifecycle tenant")
        session.add(client); session.flush()
        prop = Property(client_id=client.id, address="Synthetic address", postcode="ZZ1 1ZZ")
        session.add(prop); session.flush()
        resident = Resident(
            client_id=client.id, property_id=prop.id, name="Synthetic resident",
            phone="+440000000002", email="lifecycle@example.test",
        )
        contractor = Contractor(
            client_id=client.id, name="Synthetic eligible contractor", trade="Plumber",
            postcode_coverage="ZZ1", qualification_summary="SYNTHETIC TEST",
            qualification_expiry="2099-12-31", insurance_expiry="2099-12-31", active=True,
        )
        manager = User(
            client_id=client.id, email="manager-lifecycle@example.test",
            password_hash="x", role="manager", active=True,
        )
        basic = User(
            client_id=client.id, email="basic-lifecycle@example.test",
            password_hash="x", role="viewer", active=True,
        )
        safety = User(
            client_id=client.id, email="safety-lifecycle@example.test",
            password_hash="x", role="safety_manager", active=True,
        )
        session.add_all([resident, contractor, manager, basic, safety]); session.commit()
        ids = {
            "client": client.id, "property": prop.id, "resident": resident.id,
            "contractor": contractor.id, "manager": manager.id, "basic": basic.id,
            "safety": safety.id,
        }
    yield factory, ids
    engine.dispose()


def create_work_order(factory, ids, description="Tap is dripping", status="NEW"):
    with factory() as session:
        work_order = WorkOrder(
            client_id=ids["client"], property_id=ids["property"], resident_id=ids["resident"],
            assigned_contractor_id=ids["contractor"], description=description, status=status,
            category="Plumbing", trade="Plumber", urgency="P3", ai_confidence=.9,
        )
        session.add(work_order); session.commit()
        return work_order.id


def create_critical(factory, ids, text="I smell gas"):
    work_order_id = create_work_order(factory, ids, text)
    decision_engine.apply_intake_rules(work_order_id)
    return work_order_id


@pytest.mark.parametrize("mutation", ["status", "urgency", "flags", "state", "delete_state"])
def test_active_critical_latch_rejects_direct_orm_bypass(lifecycle_db, mutation):
    factory, ids = lifecycle_db
    work_order_id = create_critical(factory, ids)
    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        state = session.get(CriticalSafetyState, work_order_id)
        if mutation == "status":
            work_order.status = "CLOSED"; work_order.closed_at = datetime.now(timezone.utc)
        elif mutation == "urgency":
            work_order.urgency = "P3"
        elif mutation == "flags":
            work_order.safety_flags = "[]"
        elif mutation == "state":
            state.active = False
        else:
            session.delete(state)
        with pytest.raises(WorkOrderStateError):
            session.commit()
    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        state = session.get(CriticalSafetyState, work_order_id)
        assert state.active
        assert work_order.status == "HUMAN_REVIEW"
        assert work_order.urgency == "P1"
        assert "GAS_SMELL" in work_order.safety_flags


def test_post_safety_clearance_hold_requires_separate_authorised_release(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_critical(factory, ids)
    with factory() as session:
        clear_critical_safety(
            session, work_order_id, actor_user_id=ids["safety"],
            reason="Synthetic qualified engineer isolated and tested the installation",
            client_id=ids["client"],
        )
        session.commit()
        approval_id = session.query(Approval).filter_by(
            work_order_id=work_order_id, approval_type="POST_SAFETY_CLEARANCE", status="PENDING"
        ).one().id

    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        work_order.status = "READY_FOR_DISPATCH"
        with pytest.raises(WorkOrderStateError, match="pending human-review hold"):
            session.commit()

    assert not operations.approve_operational_action(approval_id, ids["basic"], "Unauthorised release")
    assert not operations.approve_operational_action(approval_id, ids["manager"], "no")
    assert operations.approve_operational_action(
        approval_id, ids["manager"], "Independent manager reviewed the completed safety clearance"
    )
    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        state = session.get(CriticalSafetyState, work_order_id)
        assert not state.active
        assert work_order.status == "READY_FOR_DISPATCH"
        assert session.query(AuditEvent).filter_by(
            work_order_id=work_order_id, event="APPROVAL_APPROVED"
        ).count() == 1


def test_illegal_noncritical_transition_fails_at_commit(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids)
    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        work_order.status = "CLOSED"; work_order.closed_at = datetime.now(timezone.utc)
        with pytest.raises(WorkOrderStateError, match="Illegal work-order transition"):
            session.commit()


def test_lifecycle_transition_is_audited_and_reopen_clears_closed_timestamp(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids, status="READY_TO_CLOSE")
    assert operations.close_work_order(work_order_id, ids["manager"])
    assert operations.reopen_work_order(work_order_id, ids["manager"], "Resident reported recurrence")
    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        assert work_order.status == "REOPENED"
        assert work_order.closed_at is None
        transitions = session.query(AuditEvent).filter_by(
            work_order_id=work_order_id, event="WORK_ORDER_STATUS_CHANGED"
        ).count()
        assert transitions == 2


@pytest.mark.parametrize("text,code", [
    ("A vulnerable child is at risk from domestic abuse", "SAFEGUARDING"),
    ("The caller is threatening me with a weapon", "THREAT"),
])
def test_red_human_safety_concerns_create_monotonic_critical_latch(lifecycle_db, text, code):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids, text)
    decision_engine.apply_intake_rules(work_order_id)
    with factory() as session:
        work_order = session.get(WorkOrder, work_order_id)
        assert critical_safety_active(session, work_order_id)
        assert code in work_order.safety_flags
        assert work_order.status == "HUMAN_REVIEW"
        assert work_order.urgency == "P1"


def test_expired_contractor_cannot_be_selected_or_approved(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids, status="READY_FOR_DISPATCH")
    with factory() as session:
        contractor = session.get(Contractor, ids["contractor"])
        contractor.qualification_expiry = "2000-01-01"
        approval = Approval(
            client_id=ids["client"], work_order_id=work_order_id,
            approval_type="DISPATCH", proposed_action="Dispatch", reason="Synthetic test",
        )
        session.add(approval); session.commit(); approval_id = approval.id
    assert operations.select_contractor(work_order_id) is None
    assert not operations.approve_operational_action(approval_id, ids["manager"])


def test_approval_rejection_requires_role_reason_and_audit(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids, status="READY_FOR_DISPATCH")
    with factory() as session:
        approval = Approval(
            client_id=ids["client"], work_order_id=work_order_id,
            approval_type="DISPATCH", proposed_action="Dispatch", reason="Synthetic test",
        )
        session.add(approval); session.commit(); approval_id = approval.id
    assert not operations.reject_operational_action(approval_id, ids["basic"], "Not authorised")
    assert not operations.reject_operational_action(approval_id, ids["manager"], "no")
    assert operations.reject_operational_action(approval_id, ids["manager"], "Contractor choice requires review")
    assert not operations.reject_operational_action(approval_id, ids["manager"], "Replay")
    with factory() as session:
        assert session.get(Approval, approval_id).status == "REJECTED"
        assert session.query(AuditEvent).filter_by(
            work_order_id=work_order_id, event="APPROVAL_REJECTED"
        ).count() == 1


def test_identity_hold_requires_authorised_reason_before_progression(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids, status="HUMAN_REVIEW")
    with factory() as session:
        approval = Approval(
            client_id=ids["client"], work_order_id=work_order_id,
            approval_type="IDENTITY", proposed_action="Verify identity", reason="Unverified caller",
        )
        session.add(approval); session.commit(); approval_id=approval.id
    assert not operations.approve_operational_action(approval_id, ids["basic"], "Documents checked")
    assert not operations.approve_operational_action(approval_id, ids["manager"], "no")
    assert operations.approve_operational_action(
        approval_id, ids["manager"], "Resident identity independently verified"
    )
    with factory() as session:
        assert session.get(WorkOrder, work_order_id).status == "READY_FOR_DISPATCH"
        assert session.get(Approval, approval_id).status == "APPROVED"


def test_unknown_triage_requires_explicit_human_classification(lifecycle_db):
    factory, ids = lifecycle_db
    work_order_id = create_work_order(factory, ids, description="Something is odd", status="HUMAN_REVIEW")
    with factory() as session:
        work_order=session.get(WorkOrder,work_order_id);work_order.category="Unknown";work_order.trade="General";work_order.ai_confidence=.45
        approval = Approval(
            client_id=ids["client"], work_order_id=work_order_id,
            approval_type="TRIAGE", proposed_action="Classify request", reason="Unknown category",
        )
        session.add(approval); session.commit(); approval_id=approval.id
    assert not operations.approve_operational_action(approval_id, ids["manager"], "Looks routine")
    assert not operations.resolve_triage(approval_id, ids["basic"], "Plumbing", "Plumber", "P3", "Reviewed request")
    assert not operations.resolve_triage(approval_id, ids["manager"], "Plumbing", "Plumber", "P1", "Reviewed request")
    assert operations.resolve_triage(
        approval_id, ids["manager"], "Plumbing", "Plumber", "P3", "Supervisor classified the supplied details"
    )
    with factory() as session:
        work_order=session.get(WorkOrder,work_order_id)
        assert (work_order.category,work_order.trade,work_order.urgency,work_order.status)==(
            "Plumbing","Plumber","P3","READY_FOR_DISPATCH"
        )
        assert session.query(AuditEvent).filter_by(work_order_id=work_order_id,event="TRIAGE_RESOLVED").count()==1


def test_escalation_resolution_is_role_bound_and_red_requires_safety_clearance(lifecycle_db):
    factory,ids=lifecycle_db
    normal_id=create_work_order(factory,ids,status="HUMAN_REVIEW")
    critical_id=create_critical(factory,ids)
    with factory() as session:
        amber=Escalation(work_order_id=normal_id,level="AMBER",reason="Review",status="OPEN")
        red=session.query(Escalation).filter_by(work_order_id=critical_id,level="RED").one()
        session.add(amber);session.commit();amber_id=amber.id;red_id=red.id
    assert not operations.resolve_escalation(amber_id,ids["basic"],"Reviewed")
    assert not operations.resolve_escalation(red_id,ids["manager"],"Cannot resolve active safety")
    assert operations.resolve_escalation(amber_id,ids["manager"],"Supervisor completed review")
    with factory() as session:
        assert session.get(Escalation,amber_id).status=="RESOLVED"
        assert session.get(Escalation,red_id).status=="OPEN"
