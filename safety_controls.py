import json
from datetime import datetime
SAFETY_CLEARANCE_REASON_MIN = 10
SAFETY_CLEARANCE_REASON_MAX = 1000
SAFETY_LATCH_ACTOR_MAX = 100
from clock import utcnow

from models import Approval, AuditEvent, CriticalSafetyState, User, WorkOrder


class SafetyStateError(ValueError):
    pass


def _flags(value: str) -> list:
    try:
        parsed = json.loads(value or "[]")
        return parsed if isinstance(parsed, list) else [{"code": "INVALID_SAFETY_STATE"}]
    except (TypeError, json.JSONDecodeError):
        return [{"code": "INVALID_SAFETY_STATE"}]


def critical_safety_active(session, work_order_id: int) -> bool:
    with session.no_autoflush:
        work_order = session.get(WorkOrder, work_order_id)
        state = session.get(CriticalSafetyState, work_order_id)
    return bool((state and state.active) or (work_order and _flags(work_order.safety_flags)))


def latch_critical_safety(session, work_order: WorkOrder, new_flags: list, actor: str) -> CriticalSafetyState | None:
    actor = (actor or "").strip()
    if not actor or len(actor) > SAFETY_LATCH_ACTOR_MAX:
        raise SafetyStateError("Safety latch actor invalid")
    with session.no_autoflush:
        state = session.get(CriticalSafetyState, work_order.id)
    if not new_flags and not (state and state.active):
        return None
    combined = {}
    for flag in _flags(state.flags) if state else []:
        combined[flag.get("code", json.dumps(flag, sort_keys=True))] = flag
    for flag in new_flags:
        combined[flag.get("code", json.dumps(flag, sort_keys=True))] = flag
    if not combined:
        combined["CRITICAL_SAFETY"] = {"code": "CRITICAL_SAFETY", "level": "RED"}
    merged = list(combined.values())
    if state:
        state.active = True
        state.flags = json.dumps(merged)
        state.cleared_at = None
        state.cleared_by_user_id = None
        state.clearance_reason = ""
        state.version += 1
    else:
        state = CriticalSafetyState(
            work_order_id=work_order.id,
            client_id=work_order.client_id,
            active=True,
            flags=json.dumps(merged),
            established_by=actor,
        )
        session.add(state)
    work_order.safety_flags = json.dumps(merged)
    work_order.urgency = "P1"
    work_order.status = "HUMAN_REVIEW"
    work_order.updated_at = utcnow()
    session.add(AuditEvent(
        work_order_id=work_order.id,
        actor=actor,
        event="CRITICAL_SAFETY_LATCHED",
        detail=json.dumps({"flags": merged}, sort_keys=True),
    ))
    return state


def enforce_latched_state(session, work_order: WorkOrder) -> bool:
    with session.no_autoflush:
        state = session.get(CriticalSafetyState, work_order.id)
    if not state or not state.active:
        return False
    work_order.safety_flags = state.flags
    work_order.urgency = "P1"
    work_order.status = "HUMAN_REVIEW"
    return True


def require_noncritical(session, work_order_id: int, action: str) -> WorkOrder:
    work_order = session.get(WorkOrder, work_order_id)
    if not work_order:
        raise SafetyStateError("Work order not found")
    if critical_safety_active(session, work_order_id):
        raise SafetyStateError(f"{action} is blocked while critical safety is unresolved")
    return work_order


def clear_critical_safety(
    session,
    work_order_id: int,
    *,
    actor_user_id: int,
    reason: str,
    client_id: int,
) -> None:
    reason = (reason or "").strip()
    if len(reason) < SAFETY_CLEARANCE_REASON_MIN:
        raise SafetyStateError("A substantive safety-clearance reason is required")
    if len(reason) > SAFETY_CLEARANCE_REASON_MAX:
        raise SafetyStateError("Safety-clearance reason is too long")
    user = session.get(User, actor_user_id)
    work_order = session.get(WorkOrder, work_order_id)
    state = session.get(CriticalSafetyState, work_order_id)
    if not user or not user.active or user.client_id != client_id or user.role not in {"admin", "safety_manager"}:
        raise SafetyStateError("Authorised human safety clearance is required")
    if not work_order or work_order.client_id != client_id:
        raise SafetyStateError("Work order is outside the authorised tenant")
    if not state and _flags(work_order.safety_flags):
        state=latch_critical_safety(session,work_order,_flags(work_order.safety_flags),"Legacy safety-state migration")
    if not state or not state.active:
        raise SafetyStateError("No active critical safety state to clear")
    session.info.setdefault("authorized_safety_clearances", {})[work_order_id] = {
        "actor_user_id": user.id,
        "reason": reason,
    }
    now = utcnow()
    state.active = False
    state.cleared_at = now
    state.cleared_by_user_id = user.id
    state.clearance_reason = reason
    state.version += 1
    work_order.safety_flags = "[]"
    work_order.status = "HUMAN_REVIEW"
    work_order.updated_at = now
    with session.no_autoflush:
        safety_approvals = session.query(Approval).filter_by(
            work_order_id=work_order.id,
            approval_type="SAFETY",
            status="PENDING",
        ).all()
    for approval in safety_approvals:
        approval.status = "RESOLVED"
        approval.decided_at = now
    session.add(AuditEvent(
        work_order_id=work_order.id,
        actor=f"User:{user.id}",
        event="CRITICAL_SAFETY_CLEARED",
        detail=json.dumps({"reason": reason, "previous_flags": json.loads(state.flags)}),
    ))
    session.add(Approval(
        client_id=client_id,
        work_order_id=work_order.id,
        approval_type="POST_SAFETY_CLEARANCE",
        proposed_action="Human review before any operational action",
        reason=reason,
    ))


def assert_status_change_allowed(session, work_order: WorkOrder, new_status: str) -> None:
    if critical_safety_active(session, work_order.id) and new_status != "HUMAN_REVIEW":
        raise SafetyStateError("Critical safety state cannot be downgraded or closed")
