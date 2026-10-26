import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_hold_actor_max_is_100():
    assert lifecycle_runtime.HOLD_ACTOR_MAX == 100
    source = inspect.getsource(lifecycle_runtime.create_hold)
    assert "HOLD_ACTOR_MAX" in source
    assert "hold_actor_too_long" in source


def test_hold_actor_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock()
    hold = lifecycle_runtime.create_hold(
        session,
        client_id=1,
        scope="subject",
        scope_id="synthetic-subject",
        reason="synthetic hold",
        actor="a" * lifecycle_runtime.HOLD_ACTOR_MAX,
    )
    assert hold is not None
    session.add.assert_called()


def test_hold_actor_rejects_overlong():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_actor_too_long"):
        lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="subject",
            scope_id="synthetic-subject",
            reason="synthetic hold",
            actor="a" * (lifecycle_runtime.HOLD_ACTOR_MAX + 1),
        )
    session.add.assert_not_called()
