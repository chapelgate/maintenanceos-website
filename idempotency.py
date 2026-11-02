from datetime import datetime
from clock import utcnow
SCOPE_MAX = 80

RESULT_REF_MAX = 200


from sqlalchemy.exc import IntegrityError

from models import ActionReceipt, RuntimeControl
from operational_logging import operational_event

ACTION_KEY_MAX = 200
AI_SIDE_EFFECT_ACTOR_MAX = 100


def claim_action(session, scope: str, action_key: str, *, client_id=None, work_order_id=None):
    if len(action_key or "") > ACTION_KEY_MAX:
        raise ValueError("Invalid action receipt key")
    if _has_control_chars(action_key):
        raise ValueError("action_key_control_chars")
    if len(scope or "") > SCOPE_MAX:
        raise ValueError("Invalid action receipt scope")
    if _has_control_chars(scope or ""):
        raise ValueError("scope_control_chars")
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


AI_SIDE_EFFECT_REASON_MAX = 500


def set_ai_side_effects(session, enabled: bool, *, actor: str, reason: str) -> None:
    actor = (actor or "").strip()
    if not actor or len(actor) > AI_SIDE_EFFECT_ACTOR_MAX:
        raise ValueError("AI side-effect actor invalid")
    if _has_control_chars(actor):
        raise ValueError("AI side-effect actor control characters")
    reason = (reason or "").strip()
    if len(reason) > AI_SIDE_EFFECT_REASON_MAX:
        raise ValueError("AI side-effect reason too long")
    if _has_control_chars(reason):
        raise ValueError("AI side-effect reason control characters")
    control = session.get(RuntimeControl, "AI_SIDE_EFFECTS")
    if control is None:
        control = RuntimeControl(key="AI_SIDE_EFFECTS")
        session.add(control)
    control.enabled = enabled
    control.updated_at = utcnow()
    control.updated_by = actor
    control.reason = reason
    operational_event(
        "ai_side_effects_changed",
        outcome="enabled" if enabled else "disabled",
        reason_code="ai_side_effects",
    )


def set_result_ref(receipt, value) -> None:
    result_ref = str(value)
    if len(result_ref) > RESULT_REF_MAX:
        raise ValueError("Invalid action receipt result_ref")
    if _has_control_chars(result_ref):
        raise ValueError("result_ref control characters")
    receipt.result_ref = result_ref


def _has_control_chars(value: str) -> bool:
    return any(
        (ord(ch) < 32 and ch not in {"\t", "\n", "\r"})
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )