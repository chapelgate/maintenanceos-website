from datetime import datetime
from clock import utcnow

from sqlalchemy.exc import IntegrityError

from models import ActionReceipt, RuntimeControl

RESULT_REF_MAX = 200


def set_result_ref(receipt, value) -> None:
    text = "" if value is None else str(value)
    if len(text) > RESULT_REF_MAX:
        raise ValueError("Invalid action receipt result_ref")
    receipt.result_ref = text


def claim_action(session, scope: str, action_key: str, *, client_id=None, work_order_id=None):
    query = session.query(ActionReceipt).filter_by(scope=scope, action_key=action_key, client_id=client_id)
    existing = query.first()
    if existing:
        return existing, False
    receipt = ActionReceipt(
        scope=scope,
        action_key=action_key,
        client_id=client_id,
        work_order_id=work_order_id,
    )
    try:
        with session.begin_nested():
            session.add(receipt)
            session.flush()
        return receipt, True
    except IntegrityError:
        existing = session.query(ActionReceipt).filter_by(
            scope=scope, action_key=action_key, client_id=client_id
        ).first()
        if not existing:
            raise
        return existing, False


def ai_side_effects_enabled(session) -> bool:
    try:
        control = session.get(RuntimeControl, "AI_SIDE_EFFECTS")
        return False if control is None else bool(control.enabled)
    except Exception:
        return False


def set_ai_side_effects(session, enabled: bool, *, actor: str, reason: str) -> None:
    control = session.get(RuntimeControl, "AI_SIDE_EFFECTS")
    if control is None:
        control = RuntimeControl(key="AI_SIDE_EFFECTS")
        session.add(control)
    control.enabled = enabled
    control.updated_at = utcnow()
    control.updated_by = actor
    control.reason = (reason or "").strip()
