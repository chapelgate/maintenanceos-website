from datetime import datetime, timezone, timedelta

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import decision_engine
import worker
from models import (
    Approval,
    AuditEvent,
    AutomationJob,
    Base,
    Client,
    Communication,
    CriticalSafetyState,
    Escalation,
    Property,
    WorkOrder,
)


@pytest.fixture
def worker_db(monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    monkeypatch.setattr(worker, "SessionLocal", factory)
    monkeypatch.setattr(decision_engine, "SessionLocal", factory)
    with factory() as session:
        client = Client(name="Synthetic worker tenant")
        session.add(client); session.flush()
        prop = Property(client_id=client.id, address="Synthetic", postcode="ZZ1 1ZZ")
        session.add(prop); session.flush()
        work_order = WorkOrder(
            client_id=client.id, property_id=prop.id, description="Synthetic worker test",
            status="READY_FOR_DISPATCH", category="Plumbing", trade="Plumber", ai_confidence=.9,
        )
        session.add(work_order); session.commit()
        ids = {"client": client.id, "property": prop.id, "work_order": work_order.id}
    yield factory, ids
    engine.dispose()


def add_job(factory, work_order_id, job_type, *, status="PENDING", attempts=0, run_at=None):
    with factory() as session:
        job = AutomationJob(
            work_order_id=work_order_id, job_type=job_type,
            run_at=run_at or datetime.now(timezone.utc) - timedelta(seconds=1),
            payload="{}", status=status, attempts=attempts,
        )
        session.add(job); session.commit()
        return job.id


def make_due(factory, job_id):
    with factory() as session:
        job = session.get(AutomationJob, job_id)
        job.run_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        session.commit()


def test_job_failure_retries_then_dead_letters_with_human_escalation(worker_db, monkeypatch):
    factory, ids = worker_db
    monkeypatch.setenv("AUTOMATION_MAX_ATTEMPTS", "3")
    monkeypatch.setenv("AUTOMATION_RETRY_BASE_SECONDS", "1")
    job_id = add_job(factory, ids["work_order"], "SYNTHETIC_FAILURE")

    for expected_attempt in (1, 2, 3):
        worker.run_due_jobs()
        with factory() as session:
            job = session.get(AutomationJob, job_id)
            assert job.attempts == expected_attempt
            assert job.status == ("FAILED" if expected_attempt == 3 else "PENDING")
        if expected_attempt < 3:
            make_due(factory, job_id)

    worker.run_due_jobs()
    with factory() as session:
        job = session.get(AutomationJob, job_id)
        assert job.status == "FAILED" and job.attempts == 3
        assert session.query(AuditEvent).filter_by(
            work_order_id=ids["work_order"], event="AUTOMATION_JOB_FAILED"
        ).count() == 3
        assert session.query(Escalation).filter_by(
            work_order_id=ids["work_order"], level="SYSTEM", status="OPEN"
        ).count() == 1


@pytest.mark.parametrize("attempts,expected", [(1, "PENDING"), (3, "FAILED")])
def test_stale_running_job_is_recovered_deterministically(worker_db, monkeypatch, attempts, expected):
    factory, ids = worker_db
    monkeypatch.setenv("AUTOMATION_MAX_ATTEMPTS", "3")
    job_id = add_job(
        factory, ids["work_order"], "SYNTHETIC_STALE",
        status="RUNNING", attempts=attempts, run_at=datetime.now(timezone.utc) - timedelta(minutes=5),
    )
    assert worker.recover_stale_jobs() == 1
    with factory() as session:
        assert session.get(AutomationJob, job_id).status == expected
        assert session.query(AuditEvent).filter_by(event="STALE_JOB_RECOVERED").count() == 1


def test_reminder_is_queued_and_never_recorded_as_sent_or_delivered(worker_db):
    factory, ids = worker_db
    job_id = add_job(factory, ids["work_order"], "APPOINTMENT_REMINDER")
    worker.run_due_jobs()
    with factory() as session:
        job = session.get(AutomationJob, job_id)
        communication = session.query(Communication).one()
        assert job.status == "COMPLETED"
        assert communication.direction == "OUTBOUND_PENDING"
        assert "queued" in communication.body.lower()
        events = {row.event for row in session.query(AuditEvent).all()}
        assert "COMMUNICATION_QUEUED" in events
        assert "COMMUNICATION_SENT" not in events
        assert "COMMUNICATION_DELIVERED" not in events


def test_critical_work_order_is_not_progressed_by_timeout_job(worker_db):
    factory, ids = worker_db
    with factory() as session:
        work_order = session.get(WorkOrder, ids["work_order"])
        work_order.description = "I smell gas"
        session.commit()
    decision_engine.apply_intake_rules(ids["work_order"])
    job_id = add_job(factory, ids["work_order"], "CONTRACTOR_RESPONSE_CHECK")
    worker.run_due_jobs()
    with factory() as session:
        work_order = session.get(WorkOrder, ids["work_order"])
        state = session.get(CriticalSafetyState, ids["work_order"])
        assert state.active
        assert work_order.status == "HUMAN_REVIEW"
        assert session.get(AutomationJob, job_id).status == "COMPLETED"
        assert session.query(Approval).filter_by(approval_type="CONTRACTOR_TIMEOUT").count() == 0
