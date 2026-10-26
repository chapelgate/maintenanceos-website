"""Persistent tenant-scoped lifecycle mechanics for the existing MaintenanceOS worker.

This module reuses the existing database, AutomationJob queue, ActionReceipt
idempotency and AuditEvent evidence. It intentionally supports only data classes
that can be safely tenant-scoped and aged from the current schema.
"""
from __future__ import annotations

import json
from datetime import datetime

from clock import utcnow
from commercial_release_controls import retention_policy
from data_lifecycle import LifecycleHold, LifecyclePolicyError, LifecycleRecord, plan_lifecycle
from idempotency import claim_action
from models import (
    AuditEvent,
    AutomationJob,
    CallSession,
    CallSessionTenant,
    Client,
    Communication,
    DataLifecycleHold,
    DataLifecycleRequest,
    UnmatchedInbound,
    WorkOrder,
)
from operations import audit


class LifecycleRuntimeError(ValueError):
    pass


SUPPORTED_RUNTIME_CLASSES = frozenset(
    {
        "work_order_closed",
        "call_transcript",
        "communication_body",
        "unmatched_inbound",
        "audit_minimal",
    }
)



VALID_LIFECYCLE_AUDIT_EVENTS = frozenset(
    {
        "DATA_LIFECYCLE_HOLD_CREATED",
        "DATA_LIFECYCLE_HOLD_RELEASED",
        "DATA_LIFECYCLE_SWEEP_QUEUED",
        "DATA_LIFECYCLE_ACTION_APPLIED",
        "DATA_LIFECYCLE_SWEEP_COMPLETED",
    }
)


def _lifecycle_audit(session, work_order_id, actor, event: str, detail: str) -> None:
    if event not in VALID_LIFECYCLE_AUDIT_EVENTS:
        raise LifecycleRuntimeError("invalid_lifecycle_audit_event")
    audit(session, work_order_id, actor, event, detail)


def _require_client(session, client_id: int) -> None:
    if not isinstance(client_id, int) or client_id <= 0 or session.get(Client, client_id) is None:
        raise LifecycleRuntimeError("valid_tenant_required")


def create_hold(
    session,
    *,
    client_id: int,
    scope: str,
    scope_id: str,
    reason: str,
    actor: str,
) -> DataLifecycleHold:
    _require_client(session, client_id)
    scope = (scope or "").strip()
    scope_id = (scope_id or "").strip()
    reason = (reason or "").strip()
    actor = (actor or "").strip()
    if scope not in {"tenant", "record", "subject", "data_class"}:
        raise LifecycleRuntimeError("invalid_hold_scope")
    if not scope_id or not reason or not actor:
        raise LifecycleRuntimeError("hold_scope_reason_actor_required")
    hold = DataLifecycleHold(
        client_id=client_id,
        scope=scope,
        scope_id=scope_id,
        reason=reason,
        created_by=actor,
        active=True,
    )
    session.add(hold)
    session.flush()
    _lifecycle_audit(
        session,
        None,
        actor,
        "DATA_LIFECYCLE_HOLD_CREATED",
        json.dumps({"hold_id": hold.id, "client_id": client_id, "scope": scope}, sort_keys=True),
    )
    return hold


RELEASE_HOLD_ACTOR_MAX = 100


def release_hold(session, hold_id: int, *, client_id: int, actor: str) -> DataLifecycleHold:
    _require_client(session, client_id)
    actor = (actor or "").strip() or "Lifecycle Controller"
    if len(actor) > RELEASE_HOLD_ACTOR_MAX:
        raise LifecycleRuntimeError("release_hold_actor_too_long")
    hold = session.get(DataLifecycleHold, hold_id)
    if not hold or hold.client_id != client_id:
        raise LifecycleRuntimeError("hold_not_found_for_tenant")
    if hold.active:
        hold.active = False
        hold.released_at = utcnow()
        _lifecycle_audit(
            session,
            None,
            actor,
            "DATA_LIFECYCLE_HOLD_RELEASED",
            json.dumps({"hold_id": hold.id, "client_id": client_id}, sort_keys=True),
        )
    return hold


SWEEP_REASON_MAX = 1000


def queue_retention_sweep(
    session,
    *,
    client_id: int,
    run_at: datetime,
    actor: str,
    reason: str = "Scheduled retention sweep",
) -> tuple[DataLifecycleRequest, AutomationJob]:
    _require_client(session, client_id)
    actor = (actor or "").strip()
    reason = (reason or "").strip()
    if not actor or not isinstance(run_at, datetime):
        raise LifecycleRuntimeError("actor_and_run_at_required")
    if len(reason) > SWEEP_REASON_MAX:
        raise LifecycleRuntimeError("sweep_reason_too_long")
    request = DataLifecycleRequest(
        client_id=client_id,
        request_type="RETENTION_SWEEP",
        subject_id="",
        status="PENDING",
        requested_by=actor,
        reason=reason,
    )
    session.add(request)
    session.flush()
    job = AutomationJob(
        work_order_id=None,
        job_type="DATA_LIFECYCLE_SWEEP",
        run_at=run_at,
        payload=json.dumps({"client_id": client_id, "request_id": request.id}, sort_keys=True),
    )
    session.add(job)
    session.flush()
    _lifecycle_audit(
        session,
        None,
        actor,
        "DATA_LIFECYCLE_SWEEP_QUEUED",
        json.dumps({"client_id": client_id, "request_id": request.id, "job_id": job.id}, sort_keys=True),
    )
    return request, job


def _active_holds(session, client_id: int) -> tuple[LifecycleHold, ...]:
    rows = (
        session.query(DataLifecycleHold)
        .filter_by(client_id=client_id, active=True)
        .order_by(DataLifecycleHold.id)
        .all()
    )
    return tuple(
        LifecycleHold(client_id=row.client_id, scope=row.scope, scope_id=row.scope_id, active=True)
        for row in rows
    )


def _subject_id(resident_id: int | None) -> str | None:
    return f"resident:{resident_id}" if resident_id is not None else None


def _records_for_class(session, client_id: int, data_class: str) -> tuple[LifecycleRecord, ...]:
    records: list[LifecycleRecord] = []
    if data_class == "work_order_closed":
        rows = (
            session.query(WorkOrder)
            .filter(
                WorkOrder.client_id == client_id,
                WorkOrder.status == "CLOSED",
                WorkOrder.closed_at.is_not(None),
            )
            .order_by(WorkOrder.id)
            .all()
        )
        for row in rows:
            records.append(
                LifecycleRecord(
                    client_id=client_id,
                    data_class=data_class,
                    record_id=f"work_order:{row.id}",
                    reference_at=row.closed_at,
                    subject_id=_subject_id(row.resident_id),
                )
            )
    elif data_class == "call_transcript":
        rows = (
            session.query(CallSession, CallSessionTenant)
            .join(CallSessionTenant, CallSessionTenant.call_session_id == CallSession.id)
            .filter(CallSessionTenant.client_id == client_id)
            .order_by(CallSession.id)
            .all()
        )
        for call, _binding in rows:
            records.append(
                LifecycleRecord(
                    client_id=client_id,
                    data_class=data_class,
                    record_id=f"call_session:{call.id}",
                    reference_at=call.ended_at or call.started_at,
                    subject_id=_subject_id(call.resident_id),
                )
            )
    elif data_class == "communication_body":
        rows = (
            session.query(Communication, WorkOrder)
            .join(WorkOrder, WorkOrder.id == Communication.work_order_id)
            .filter(WorkOrder.client_id == client_id)
            .order_by(Communication.id)
            .all()
        )
        for communication, work_order in rows:
            records.append(
                LifecycleRecord(
                    client_id=client_id,
                    data_class=data_class,
                    record_id=f"communication:{communication.id}",
                    reference_at=communication.created_at,
                    subject_id=_subject_id(work_order.resident_id),
                )
            )
    elif data_class == "unmatched_inbound":
        rows = (
            session.query(UnmatchedInbound)
            .filter_by(client_id=client_id)
            .order_by(UnmatchedInbound.id)
            .all()
        )
        for row in rows:
            records.append(
                LifecycleRecord(
                    client_id=client_id,
                    data_class=data_class,
                    record_id=f"unmatched_inbound:{row.id}",
                    reference_at=row.created_at,
                    subject_id=f"participant:{row.participant_hash}" if row.participant_hash else None,
                )
            )
    elif data_class == "audit_minimal":
        rows = (
            session.query(AuditEvent, WorkOrder)
            .join(WorkOrder, WorkOrder.id == AuditEvent.work_order_id)
            .filter(WorkOrder.client_id == client_id)
            .order_by(AuditEvent.id)
            .all()
        )
        for event, work_order in rows:
            records.append(
                LifecycleRecord(
                    client_id=client_id,
                    data_class=data_class,
                    record_id=f"audit_event:{event.id}",
                    reference_at=event.created_at,
                    subject_id=_subject_id(work_order.resident_id),
                )
            )
    else:
        raise LifecycleRuntimeError(f"runtime_class_not_supported:{data_class}")
    return tuple(records)


def plan_client_retention(session, *, client_id: int, now: datetime):
    _require_client(session, client_id)
    policy = retention_policy()
    if policy is None:
        raise LifecyclePolicyError("commercial_retention_policy_not_configured")
    holds = _active_holds(session, client_id)
    decisions = []
    for data_class in sorted(SUPPORTED_RUNTIME_CLASSES):
        records = _records_for_class(session, client_id, data_class)
        decisions.extend(
            plan_lifecycle(
                records,
                client_id=client_id,
                action="erasure",
                policy=policy,
                now=now,
                holds=holds,
            )
        )
    return tuple(decisions)


def plan_client_export(session, *, client_id: int, now: datetime):
    _require_client(session, client_id)
    decisions = []
    for data_class in sorted(SUPPORTED_RUNTIME_CLASSES):
        records = _records_for_class(session, client_id, data_class)
        decisions.extend(
            plan_lifecycle(
                records,
                client_id=client_id,
                action="export",
                policy=retention_policy() or _export_only_policy(),
                now=now,
                holds=_active_holds(session, client_id),
            )
        )
    return tuple(decisions)


def _export_only_policy():
    from data_lifecycle import LifecyclePolicy

    return LifecyclePolicy(retention={})


def _parse_record_id(record_id: str, expected: str) -> int:
    prefix = expected + ":"
    if not record_id.startswith(prefix):
        raise LifecycleRuntimeError("record_identity_invalid")
    try:
        value = int(record_id[len(prefix) :])
    except ValueError as exc:
        raise LifecycleRuntimeError("record_identity_invalid") from exc
    if value <= 0:
        raise LifecycleRuntimeError("record_identity_invalid")
    return value


def _apply_decision(session, *, client_id: int, job_id: int, decision) -> bool:
    if decision.action == "retain":
        return False
    key = f"{job_id}:{decision.data_class}:{decision.record_id}:{decision.action}"
    _receipt, fresh = claim_action(
        session,
        "DATA_LIFECYCLE",
        key,
        client_id=client_id,
        work_order_id=None,
    )
    if not fresh:
        return False

    work_order_id = None
    if decision.data_class == "work_order_closed":
        record_id = _parse_record_id(decision.record_id, "work_order")
        row = session.get(WorkOrder, record_id)
        if not row or row.client_id != client_id or row.status != "CLOSED":
            raise LifecycleRuntimeError("work_order_not_available_for_lifecycle")
        row.description = ""
        work_order_id = row.id
    elif decision.data_class == "call_transcript":
        record_id = _parse_record_id(decision.record_id, "call_session")
        binding = session.get(CallSessionTenant, record_id)
        row = session.get(CallSession, record_id)
        if not binding or binding.client_id != client_id or not row:
            raise LifecycleRuntimeError("call_not_available_for_tenant")
        row.transcript = ""
        row.summary = ""
        work_order_id = row.work_order_id
    elif decision.data_class == "communication_body":
        record_id = _parse_record_id(decision.record_id, "communication")
        row = session.get(Communication, record_id)
        work_order = session.get(WorkOrder, row.work_order_id) if row and row.work_order_id else None
        if not row or not work_order or work_order.client_id != client_id:
            raise LifecycleRuntimeError("communication_not_available_for_tenant")
        row.body = ""
        row.media_url = ""
        work_order_id = work_order.id
    elif decision.data_class == "unmatched_inbound":
        record_id = _parse_record_id(decision.record_id, "unmatched_inbound")
        row = session.get(UnmatchedInbound, record_id)
        if not row or row.client_id != client_id:
            raise LifecycleRuntimeError("unmatched_inbound_not_available_for_tenant")
        row.body = ""
        row.media_url = ""
    elif decision.data_class == "audit_minimal":
        record_id = _parse_record_id(decision.record_id, "audit_event")
        row = session.get(AuditEvent, record_id)
        work_order = session.get(WorkOrder, row.work_order_id) if row and row.work_order_id else None
        if not row or not work_order or work_order.client_id != client_id:
            raise LifecycleRuntimeError("audit_not_available_for_tenant")
        row.detail = ""
        work_order_id = work_order.id
    else:
        raise LifecycleRuntimeError(f"runtime_class_not_supported:{decision.data_class}")

    _lifecycle_audit(
        session,
        work_order_id,
        "Lifecycle Controller",
        "DATA_LIFECYCLE_ACTION_APPLIED",
        json.dumps(
            {
                "client_id": client_id,
                "data_class": decision.data_class,
                "record_id": decision.record_id,
                "action": decision.action,
                "reason": decision.reason,
                "job_id": job_id,
            },
            sort_keys=True,
        ),
    )
    return True


def execute_lifecycle_sweep(session, job: AutomationJob, now: datetime) -> int:
    try:
        payload = json.loads(job.payload or "{}")
    except json.JSONDecodeError as exc:
        raise LifecycleRuntimeError("invalid_lifecycle_job_payload") from exc
    client_id = payload.get("client_id")
    request_id = payload.get("request_id")
    if type(client_id) is not int or client_id <= 0 or type(request_id) is not int or request_id <= 0:
        raise LifecycleRuntimeError("lifecycle_job_tenant_request_required")
    _require_client(session, client_id)
    request = session.get(DataLifecycleRequest, request_id)
    if not request or request.client_id != client_id or request.request_type != "RETENTION_SWEEP":
        raise LifecycleRuntimeError("lifecycle_request_not_found_for_tenant")

    applied = 0
    for decision in plan_client_retention(session, client_id=client_id, now=now):
        if _apply_decision(session, client_id=client_id, job_id=job.id, decision=decision):
            applied += 1

    request.status = "COMPLETED"
    request.completed_at = now
    _lifecycle_audit(
        session,
        None,
        "Lifecycle Controller",
        "DATA_LIFECYCLE_SWEEP_COMPLETED",
        json.dumps(
            {"client_id": client_id, "request_id": request.id, "job_id": job.id, "applied": applied},
            sort_keys=True,
        ),
    )
    return applied
