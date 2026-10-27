import json
import os
from contextlib import suppress
from datetime import datetime, timedelta
from clock import utcnow

from apscheduler.schedulers.blocking import BlockingScheduler

from communications import queue_outbound
from product_profile import worker_banner
from idempotency import claim_action
from lifecycle import transition_work_order
from models import ActionReceipt, Approval, AutomationJob, ContractorAttempt, Escalation, SessionLocal, WorkOrder
from approval_text import bounded_proposed_action
from operations import audit
from safety_controls import critical_safety_active
from sla import sla_status


def _bounded_int(name, default, minimum, maximum):
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        value = default
    return max(minimum, min(value, maximum))


def _max_attempts():
    return _bounded_int("AUTOMATION_MAX_ATTEMPTS", 3, 1, 10)


def _lease_seconds():
    return _bounded_int("AUTOMATION_LEASE_SECONDS", 120, 10, 3600)


def _retry_delay(attempts):
    base = _bounded_int("AUTOMATION_RETRY_BASE_SECONDS", 30, 1, 3600)
    return min(base * (2 ** max(0, attempts - 1)), 3600)


def recover_stale_jobs(now=None):
    now = now or utcnow()
    with SessionLocal() as session:
        stale = session.query(AutomationJob).filter(
            AutomationJob.status == "RUNNING",
            AutomationJob.run_at <= now,
        ).all()
        for job in stale:
            if job.attempts >= _max_attempts():
                job.status = "FAILED"
            else:
                job.status = "PENDING"
                job.run_at = now
            audit(session, job.work_order_id, "Job Controller", "STALE_JOB_RECOVERED", json.dumps({
                "job_id": job.id, "attempts": job.attempts, "new_status": job.status,
            }))
        session.commit()
        return len(stale)


def _execute_job(session, job, work_order, now):
    if job.job_type == "DATA_LIFECYCLE_SWEEP":
        from lifecycle_runtime import execute_lifecycle_sweep

        execute_lifecycle_sweep(session, job, now)
        return
    if not work_order:
        return
    audit(session, work_order.id, "Job Controller", job.job_type, job.payload)
    if job.job_type == "CONTRACTOR_RESPONSE_CHECK":
        if work_order.status == "AWAITING_CONTRACTOR" and not critical_safety_active(session, work_order.id):
            existing = session.query(Approval).filter_by(
                work_order_id=work_order.id,
                approval_type="CONTRACTOR_TIMEOUT",
                status="PENDING",
            ).first()
            if not existing:
                if work_order.assigned_contractor_id:
                    attempt=session.query(ContractorAttempt).filter_by(
                        work_order_id=work_order.id,contractor_id=work_order.assigned_contractor_id
                    ).first()
                    if not attempt:
                        attempt=ContractorAttempt(
                            client_id=work_order.client_id,work_order_id=work_order.id,
                            contractor_id=work_order.assigned_contractor_id,
                        )
                        session.add(attempt)
                    attempt.status="TIMED_OUT";attempt.responded_at=now
                transition_work_order(
                    session, work_order, "FAILED_CONTRACTOR",
                    actor="Job Controller", reason="Contractor response deadline expired", flush=True,
                )
                session.add(Approval(
                    client_id=work_order.client_id,
                    work_order_id=work_order.id,
                    approval_type="CONTRACTOR_TIMEOUT",
                    proposed_action=bounded_proposed_action("Select fallback contractor"),
                    reason="Contractor response timer expired",
                ))
                transition_work_order(
                    session, work_order, "HUMAN_REVIEW",
                    actor="Job Controller", reason="Fallback contractor requires human review",
                )
    elif job.job_type == "AVAILABILITY_CHECK":
        if work_order.status == "CONTRACTOR_ACCEPTED":
            transition_work_order(
                session, work_order, "AWAITING_AVAILABILITY",
                actor="Job Controller", reason="Awaiting accepted contractor availability",
            )
    elif job.job_type == "APPOINTMENT_REMINDER":
        queue_outbound(
            session,
            client_id=work_order.client_id,
            work_order_id=work_order.id,
            channel="EMAIL",
            recipient="synthetic-queue@example.test",
            body="Appointment reminder queued for delivery",
            action_key=f"appointment-reminder:{job.id}",
        )
    else:
        raise ValueError(f"Unsupported automation job type: {job.job_type}")


def _record_job_failure(job_id, error):
    now = utcnow()
    with SessionLocal() as session:
        job = session.get(AutomationJob, job_id)
        if not job:
            return
        final = job.attempts >= _max_attempts()
        job.status = "FAILED" if final else "PENDING"
        if not final:
            job.run_at = now + timedelta(seconds=_retry_delay(job.attempts))
        detail = json.dumps({
            "job_id": job.id,
            "job_type": job.job_type,
            "attempts": job.attempts,
            "final": final,
            "error_type": type(error).__name__,
        })
        audit(session, job.work_order_id, "Job Controller", "AUTOMATION_JOB_FAILED", detail)
        if final:
            existing = session.query(Escalation).filter_by(
                work_order_id=job.work_order_id,
                level="SYSTEM",
                status="OPEN",
            ).first()
            if not existing:
                session.add(Escalation(
                    work_order_id=job.work_order_id,
                    level="SYSTEM",
                    reason=f"Automation job {job.id} exhausted {_max_attempts()} attempts",
                ))
        session.commit()


def run_due_jobs():
    now = utcnow()
    recover_stale_jobs(now)
    with SessionLocal() as session:
        job_ids = [row[0] for row in session.query(AutomationJob.id).filter(
            AutomationJob.status == "PENDING",
            AutomationJob.run_at <= now,
        ).all()]

    for job_id in job_ids:
        with SessionLocal() as session:
            claimed = session.query(AutomationJob).filter_by(id=job_id, status="PENDING").update({
                AutomationJob.status: "RUNNING",
                AutomationJob.run_at: now + timedelta(seconds=_lease_seconds()),
                AutomationJob.attempts: AutomationJob.attempts + 1,
            }, synchronize_session=False)
            if claimed != 1:
                session.rollback()
                continue
            session.commit()

        try:
            with SessionLocal() as session:
                job = session.get(AutomationJob, job_id)
                if not job or job.status != "RUNNING":
                    continue
                work_order = session.get(WorkOrder, job.work_order_id) if job.work_order_id else None
                client_id = work_order.client_id if work_order else None
                if client_id is None and job.job_type == "DATA_LIFECYCLE_SWEEP":
                    try:
                        payload = json.loads(job.payload or "{}")
                        candidate = payload.get("client_id")
                        client_id = candidate if type(candidate) is int and candidate > 0 else None
                    except json.JSONDecodeError:
                        client_id = None
                completed_receipt = session.query(ActionReceipt).filter_by(
                    scope="TIMER_JOB", action_key=str(job_id), client_id=client_id
                ).first()
                if completed_receipt:
                    job.status = "COMPLETED"
                    session.commit()
                    continue
                _execute_job(session, job, work_order, now)
                _, fresh = claim_action(
                    session,
                    "TIMER_JOB",
                    str(job_id),
                    client_id=client_id,
                    work_order_id=job.work_order_id,
                )
                if not fresh:
                    raise RuntimeError("Timer completion receipt raced unexpectedly")
                job.status = "COMPLETED"
                session.commit()
        except Exception as exc:
            _record_job_failure(job_id, exc)


def check_sla():
    with SessionLocal() as session:
        rows = session.query(WorkOrder).filter(~WorkOrder.status.in_(["CLOSED", "CANCELLED"])).all()
        for work_order in rows:
            status, age, target = sla_status(work_order.urgency, work_order.created_at)
            if status == "BREACHED":
                existing = session.query(Escalation).filter_by(
                    work_order_id=work_order.id, level="SLA", status="OPEN"
                ).first()
                if not existing:
                    session.add(Escalation(
                        work_order_id=work_order.id,
                        level="SLA",
                        reason=f"{work_order.urgency} SLA breached: {age} min / {target} target",
                    ))
        session.commit()


def cycle():
    run_due_jobs()
    check_sla()
    with suppress(Exception):
        from call_capacity import expire_stale_leases
        expire_stale_leases()


if __name__ == "__main__":
    from models import init_db

    init_db()
    scheduler = BlockingScheduler()
    scheduler.add_job(cycle, "interval", seconds=30, max_instances=1, coalesce=True)
    print(worker_banner())
    cycle()
    scheduler.start()
