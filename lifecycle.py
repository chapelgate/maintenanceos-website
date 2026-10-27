import json
from clock import utcnow

from audit_text import redact_detail
from lifecycle_rules import transition_allowed
from models import AuditEvent, WorkOrder, WorkOrderStateError
from safety_controls import critical_safety_active

TRANSITION_REASON_MAX = 1000
TRANSITION_ACTOR_MAX = 100
TRANSITION_AUDIT_DETAIL_MAX = 8000


def transition_work_order(
    session,
    work_order: WorkOrder,
    new_status: str,
    *,
    actor: str,
    reason: str,
    flush: bool = False,
) -> bool:
    """Apply one validated, audited work-order state transition."""
    actor = (actor or "").strip()
    reason = (reason or "").strip()
    if not actor or len(actor) > TRANSITION_ACTOR_MAX:
        raise ValueError("transition actor invalid")
    if len(reason) > TRANSITION_REASON_MAX:
        raise ValueError("transition reason invalid")
    if any(ord(ch) < 32 and ch not in "\t\n\r" for ch in actor + reason):
        raise ValueError("transition control characters")

    old_status = work_order.status
    if old_status == new_status:
        return False
    if critical_safety_active(session, work_order.id) and new_status != "HUMAN_REVIEW":
        raise WorkOrderStateError("Critical safety state cannot be progressed or closed")
    if new_status != "HUMAN_REVIEW" and not transition_allowed(old_status, new_status):
        raise WorkOrderStateError(f"Illegal work-order transition: {old_status} -> {new_status}")

    detail = redact_detail(
        json.dumps(
            {"from": old_status, "to": new_status, "reason": reason},
            sort_keys=True,
        )
    )
    if len(detail) > TRANSITION_AUDIT_DETAIL_MAX:
        raise ValueError("transition audit detail invalid")

    work_order.status = new_status
    work_order.updated_at = utcnow()
    if new_status == "CLOSED":
        work_order.closed_at = work_order.updated_at
    elif old_status == "CLOSED":
        work_order.closed_at = None
    session.add(
        AuditEvent(
            work_order_id=work_order.id,
            actor=actor,
            event="WORK_ORDER_STATUS_CHANGED",
            detail=detail,
        )
    )
    if flush:
        session.flush()
    return True
