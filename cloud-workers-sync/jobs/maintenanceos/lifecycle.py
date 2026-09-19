import json
from datetime import datetime
from clock import utcnow

from lifecycle_rules import transition_allowed
from models import AuditEvent, WorkOrder, WorkOrderStateError
from safety_controls import critical_safety_active


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
    old_status = work_order.status
    if old_status == new_status:
        return False
    if critical_safety_active(session, work_order.id) and new_status != "HUMAN_REVIEW":
        raise WorkOrderStateError("Critical safety state cannot be progressed or closed")
    if new_status != "HUMAN_REVIEW" and not transition_allowed(old_status, new_status):
        raise WorkOrderStateError(f"Illegal work-order transition: {old_status} -> {new_status}")

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
            detail=json.dumps(
                {"from": old_status, "to": new_status, "reason": (reason or "").strip()},
                sort_keys=True,
            ),
        )
    )
    if flush:
        session.flush()
    return True
