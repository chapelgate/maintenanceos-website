import json
from datetime import datetime, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import lifecycle_runtime
import worker
from data_lifecycle import LifecyclePolicyError
from models import (
    ActionReceipt,
    AuditEvent,
    Base,
    CallSession,
    CallSessionTenant,
    Client,
    Communication,
    DataLifecycleHold,
    DataLifecycleRequest,
    Property,
    Resident,
    UnmatchedInbound,
    WorkOrder,
)


NOW = datetime(2030, 1, 31, 12, 0, 0)


@pytest.fixture
def lifecycle_db(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(worker, "SessionLocal", factory)

    required = {
        "work_order_closed": 1,
        "call_transcript": 1,
        "communication_body": 1,
        "unmatched_inbound": 1,
        "contractor_profile": 1,
        "user_account": 1,
        "audit_minimal": 1,
        "backup_copy": 1,
    }
    monkeypatch.setenv("DATA_RETENTION_POLICY_JSON", json.dumps(required))
    with factory() as session:
        client_a = Client(name="A")
        client_b = Client(name="B")
        session.add_all([client_a, client_b]); session.flush()
        prop_a = Property(client_id=client_a.id, address="A", postcode="AA1 1AA")
        prop_b = Property(client_id=client_b.id, address="B", postcode="BB1 1BB")
        session.add_all([prop_a, prop_b]); session.flush()
        resident_a = Resident(client_id=client_a.id, property_id=prop_a.id, name="A", phone="1", email="a@example.test")
        resident_b = Resident(client_id=client_b.id, property_id=prop_b.id, name="B", phone="2", email="b@example.test")
        session.add_all([resident_a, resident_b]); session.flush()
        closed_at = NOW - timedelta(days=10)
        wo_a = WorkOrder(
            client_id=client_a.id, property_id=prop_a.id, resident_id=resident_a.id,
            description="erase me", status="CLOSED", closed_at=closed_at,
        )
        wo_b = WorkOrder(
            client_id=client_b.id, property_id=prop_b.id, resident_id=resident_b.id,
            description="other tenant", status="CLOSED", closed_at=closed_at,
        )
        session.add_all([wo_a, wo_b]); session.flush()
        call_a = CallSession(
            call_sid="CA", caller="hash-a", resident_id=resident_a.id, work_order_id=wo_a.id,
            transcript="resident transcript", summary="resident summary",
            started_at=closed_at, ended_at=closed_at,
        )
        session.add(call_a); session.flush()
        session.add(CallSessionTenant(call_session_id=call_a.id, client_id=client_a.id))
        comm_a = Communication(
            work_order_id=wo_a.id, channel="EMAIL", direction="INBOUND", participant="hash",
            body="resident body", media_url="https://example.test/a", created_at=closed_at,
        )
        unmatched_a = UnmatchedInbound(
            client_id=client_a.id, channel="EMAIL", participant_hash="hash",
            body="unmatched body", media_url="https://example.test/u", created_at=closed_at,
        )
        audit_a = AuditEvent(
            work_order_id=wo_a.id, actor="Tester", event="OLD_EVENT", detail="personal detail", created_at=closed_at,
        )
        session.add_all([comm_a, unmatched_a, audit_a])
        session.commit()
        ids = {
            "a": client_a.id, "b": client_b.id, "wo_a": wo_a.id, "wo_b": wo_b.id,
            "call_a": call_a.id,
        }
    yield factory, ids
    engine.dispose()


def test_missing_policy_fails_closed(lifecycle_db, monkeypatch):
    factory, ids = lifecycle_db
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON")
    with factory() as session:
        with pytest.raises(LifecyclePolicyError, match="commercial_retention_policy_not_configured"):
            lifecycle_runtime.plan_client_retention(session, client_id=ids["a"], now=NOW)


def test_hold_blocks_erasure_but_not_export(lifecycle_db):
    factory, ids = lifecycle_db
    with factory() as session:
        lifecycle_runtime.create_hold(
            session, client_id=ids["a"], scope="record", scope_id=f"work_order:{ids['wo_a']}",
            reason="complaint hold", actor="Tester",
        )
        session.commit()
    with factory() as session:
        retention = lifecycle_runtime.plan_client_retention(session, client_id=ids["a"], now=NOW)
        export = lifecycle_runtime.plan_client_export(session, client_id=ids["a"], now=NOW)
        held = next(x for x in retention if x.record_id == f"work_order:{ids['wo_a']}")
        exported = next(x for x in export if x.record_id == f"work_order:{ids['wo_a']}")
        assert (held.action, held.reason) == ("retain", "active_hold")
        assert exported.action == "export"


def test_sweep_is_tenant_scoped_idempotent_and_preserves_hold(lifecycle_db, monkeypatch):
    factory, ids = lifecycle_db
    with factory() as session:
        lifecycle_runtime.create_hold(
            session, client_id=ids["a"], scope="record", scope_id=f"work_order:{ids['wo_a']}",
            reason="legal hold", actor="Tester",
        )
        request, job = lifecycle_runtime.queue_retention_sweep(
            session, client_id=ids["a"], run_at=NOW - timedelta(seconds=1), actor="Tester",
        )
        request_id, job_id = request.id, job.id
        session.commit()

    monkeypatch.setattr(worker, "utcnow", lambda: NOW)
    worker.run_due_jobs()

    with factory() as session:
        assert session.get(WorkOrder, ids["wo_a"]).description == "erase me"
        assert session.get(WorkOrder, ids["wo_b"]).description == "other tenant"
        call = session.get(CallSession, ids["call_a"])
        assert call.transcript == "" and call.summary == ""
        assert session.get(DataLifecycleRequest, request_id).status == "COMPLETED"
        assert session.get(DataLifecycleHold, 1).active is True
        receipts = session.query(ActionReceipt).filter_by(client_id=ids["a"], scope="DATA_LIFECYCLE").count()
        assert receipts >= 1
        first_receipts = receipts

    worker.run_due_jobs()
    with factory() as session:
        assert session.query(ActionReceipt).filter_by(client_id=ids["a"], scope="DATA_LIFECYCLE").count() == first_receipts
        assert session.get(WorkOrder, ids["wo_b"]).description == "other tenant"
        assert session.query(AuditEvent).filter_by(event="DATA_LIFECYCLE_SWEEP_COMPLETED").count() == 1


def test_cross_tenant_hold_release_is_rejected(lifecycle_db):
    factory, ids = lifecycle_db
    with factory() as session:
        hold = lifecycle_runtime.create_hold(
            session, client_id=ids["a"], scope="tenant", scope_id=str(ids["a"]),
            reason="hold", actor="Tester",
        )
        session.commit()
        hold_id = hold.id
    with factory() as session:
        with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_not_found_for_tenant"):
            lifecycle_runtime.release_hold(session, hold_id, client_id=ids["b"], actor="Other")


def test_unsupported_class_fails_closed(lifecycle_db):
    factory, ids = lifecycle_db
    with factory() as session:
        with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="runtime_class_not_supported"):
            lifecycle_runtime._records_for_class(session, ids["a"], "user_account")
