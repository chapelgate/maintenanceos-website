import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_release_hold_actor_max_is_100():
    assert lifecycle_runtime.RELEASE_HOLD_ACTOR_MAX == 100
    source = inspect.getsource(lifecycle_runtime.release_hold)
    assert "RELEASE_HOLD_ACTOR_MAX" in source
    assert "release_hold_actor_too_long" in source


def test_release_hold_actor_accepts_bounded_text():
    session = MagicMock()
    hold = MagicMock()
    hold.client_id = 1
    hold.active = True
    hold.id = 7
    session.get.side_effect = lambda model, key: hold if key == 7 else MagicMock()
    result = lifecycle_runtime.release_hold(
        session,
        7,
        client_id=1,
        actor="a" * lifecycle_runtime.RELEASE_HOLD_ACTOR_MAX,
    )
    assert result is hold
    assert hold.active is False


def test_release_hold_actor_rejects_overlong():
    session = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="release_hold_actor_too_long"):
        lifecycle_runtime.release_hold(
            session,
            7,
            client_id=1,
            actor="a" * (lifecycle_runtime.RELEASE_HOLD_ACTOR_MAX + 1),
        )
    session.get.assert_called()
