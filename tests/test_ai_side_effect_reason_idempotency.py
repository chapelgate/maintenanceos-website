import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

import idempotency


def test_ai_side_effect_reason_max_is_500():
    assert idempotency.AI_SIDE_EFFECT_REASON_MAX == 500
    source = inspect.getsource(idempotency.set_ai_side_effects)
    assert "AI_SIDE_EFFECT_REASON_MAX" in source


def test_ai_side_effect_reason_accepts_bounded_text():
    session = MagicMock()
    control = SimpleNamespace(enabled=False, updated_at=None, updated_by=None, reason="")
    session.get.return_value = control
    reason = "a" * idempotency.AI_SIDE_EFFECT_REASON_MAX
    idempotency.set_ai_side_effects(session, False, actor="User:1", reason=reason)
    assert control.reason == reason
    assert control.updated_by == "User:1"


def test_ai_side_effect_reason_rejects_overlong():
    session = MagicMock()
    session.get.side_effect = AssertionError("session must not be read for overlong reason")
    with pytest.raises(ValueError, match="too long"):
        idempotency.set_ai_side_effects(
            session,
            False,
            actor="User:1",
            reason="a" * (idempotency.AI_SIDE_EFFECT_REASON_MAX + 1),
        )
