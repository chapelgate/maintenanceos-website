import json
import hashlib
ACTION_KEY_MAX = 200
DETAIL_MAX = 4000
ACTION_ACTOR_MAX = 100
ACTION_TYPE_MAX = 64


from sqlalchemy.exc import IntegrityError

from models import (
    ActionExecution,
    Appointment,
    AuditEvent,
    CallEvent,
    CallSessionTenant,
    ContractorAcceptance,
    ResidentConfirmation,
    WorkOrder,
)


ACTION_STATES = {"REQUESTED", "PENDING", "ATTEMPTED", "FAILED", "SUCCEEDED", "CANCELLED", "UNKNOWN"}
PROVIDER_REFERENCE_MAX = 200
ACTION_ACTOR_MAX = 100
CONFIRMABLE_ACTIONS = {
    "contractor_contacted",
    "contractor_dispatched",
    "appointment_booked",
    "appointment_cancelled",
    "emergency_services_contacted",
    "emergency_services_dispatched",
    "human_operator_contacted",
    "human_transfer_connected",
    "other_party_notified",
    "repair_completed",
}


def record_action_result(
    session,
    *,
    client_id: int,
    work_order_id: int | None,
    call_session_id: int | None = None,
    action_type: str,
    action_key: str,
    status: str,
    actor: str,
    provider_reference: str = "",
    detail: str = "",
) -> ActionExecution:
    action_type = (action_type or "").strip().lower()
    action_key = (action_key or "").strip()
    status = (status or "").strip().upper()
    provider_reference = (provider_reference or "").strip()
    actor = (actor or "").strip()
    if len(action_type) > ACTION_TYPE_MAX:
        raise ValueError("Action type exceeds maximum length")
    if action_type not in CONFIRMABLE_ACTIONS:
        raise ValueError("Unknown confirmable action")
    if status not in ACTION_STATES:
        raise ValueError("Unknown action state")
    if not action_key:
        raise ValueError("Action result requires an idempotency key")
    if len(action_key) > ACTION_KEY_MAX:
        raise ValueError("Action key exceeds maximum length")
    if not actor or len(actor) > ACTION_ACTOR_MAX:
        raise ValueError("Action actor invalid")
    if len(detail) > DETAIL_MAX:
        raise ValueError("Action detail exceeds maximum length")
    if len(provider_reference) > PROVIDER_REFERENCE_MAX:
        raise ValueError("Provider reference exceeds maximum length")
    if work_order_id:
        work_order = session.get(WorkOrder, work_order_id)
        if not work_order or work_order.client_id != client_id:
            raise ValueError("Action result is outside the authorised tenant")
    elif call_session_id:
        binding=session.get(CallSessionTenant,call_session_id)
        if not binding or binding.client_id!=client_id:
            raise ValueError("Action result is outside the authorised call tenant")
    else:
        raise ValueError("Action result requires a tenant-bound work order or call")
    existing = session.query(ActionExecution).filter_by(
        client_id=client_id,
        action_type=action_type,
        action_key=action_key,
    ).first()
    if existing:
        if existing.status != status or existing.work_order_id != work_order_id:
            raise ValueError("Contradictory action result for an existing idempotency key")
        return existing
    result = ActionExecution(
        client_id=client_id,
        work_order_id=work_order_id,
        action_type=action_type,
        action_key=action_key,
        status=status,
        provider_reference=provider_reference,
        detail=(detail or "").strip(),
    )
    try:
        with session.begin_nested():
            session.add(result)
            session.flush()
    except IntegrityError:
        existing = session.query(ActionExecution).filter_by(
            client_id=client_id,
            action_type=action_type,
            action_key=action_key,
        ).first()
        if not existing or existing.status != status or existing.work_order_id != work_order_id:
            raise
        return existing
    audit_detail=json.dumps({
        "action_type": action_type,
        "status": status,
        "action_key": action_key,
        "provider_reference": provider_reference,
    }, sort_keys=True)
    if work_order_id:
        session.add(AuditEvent(
            work_order_id=work_order_id,actor=actor,event="ACTION_RESULT_RECORDED",detail=audit_detail,
        ))
    else:
        session.add(CallEvent(
            call_session_id=call_session_id,
            client_id=client_id,
            event_key=hashlib.sha256(f"action-result:{action_type}:{action_key}".encode()).hexdigest(),
            event="ACTION_RESULT_RECORDED",
            detail=audit_detail,
        ))
    return result


def confirmed_actions(session, work_order_id: int | None) -> set[str]:
    if not work_order_id:
        return set()
    confirmed = set()
    latest = {}
    for result in session.query(ActionExecution).filter_by(work_order_id=work_order_id).order_by(ActionExecution.id).all():
        latest[result.action_type] = result
    confirmed.update(action for action, result in latest.items() if result.status == "SUCCEEDED")

    if session.get(ContractorAcceptance, work_order_id):
        confirmed.add("contractor_contacted")
    booked = session.query(Appointment).filter_by(work_order_id=work_order_id, status="BOOKED").first()
    booked_audit = session.query(AuditEvent).filter_by(
        work_order_id=work_order_id, event="APPOINTMENT_BOOKED"
    ).first()
    if booked and booked_audit:
        confirmed.update({"contractor_contacted", "appointment_booked"})
    cancelled = session.query(Appointment).filter_by(work_order_id=work_order_id, status="CANCELLED").first()
    cancelled_audit = session.query(AuditEvent).filter_by(
        work_order_id=work_order_id, event="APPOINTMENT_CANCELLED"
    ).first()
    if cancelled and cancelled_audit:
        confirmed.add("appointment_cancelled")
    resolved = session.query(ResidentConfirmation).filter_by(
        work_order_id=work_order_id, resolved=True
    ).order_by(ResidentConfirmation.id.desc()).first()
    if resolved:
        confirmed.add("repair_completed")
    return confirmed
