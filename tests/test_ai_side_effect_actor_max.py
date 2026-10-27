import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

import idempotency


def test_ai_side_effect_actor_max_is_100():
    assert idempotency.AI_SIDE_EFFECT_ACTOR_MAX == 100
    source = inspect.getsource(idempotency.set_ai_side_effects)
    assert "AI_SIDE_EFFECT_ACTOR_MAX" in source


def test_ai_side_effect_rejects_blank_actor():
    session = MagicMock()
    work_order = SimpleNamespace(id=1, client_id=1)
    session.get.return_value = None
    with pytest.raises(ValueError, match="AI side-effect actor invalid"):
        idempotency.set_ai_side_effects(session, False, actor="   ", reason="controlled test stop")


def test_ai_side_effect_rejects_overlong_actor():
    session = MagicMock()
    session.get.return_value = None
    with pytest.raises(ValueError, match="AI side-effect actor invalid"):
        idempotency.set_ai_side_effects(
            session,
            False,
            actor="a" * (idempotency.AI_SIDE_EFFECT_ACTOR_MAX + 1),
            reason="controlled test stop",
        )


def test_ai_side_effect_accepts_bounded_actor():
    session = MagicMock()
    control = MagicMock()
    control.enabled = False
    control.reason = ""
    session.get.return_value = None
    idempotency.set_ai_side_effects(session, False, actor="Operator:1", reason="controlled test stop")
    assert session.add.called
