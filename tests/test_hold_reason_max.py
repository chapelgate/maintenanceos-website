import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_hold_reason_max_is_1000():
    assert lifecycle_runtime.HOLD_REASON_MAX == 1000
    source = inspect.getsource(lifecycle_runtime.create_hold)
    assert "HOLD_REASON_MAX" in source
    assert "hold_reason_too_long" in source


def test_hold_reason_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock()
    hold = lifecycle_runtime.create_hold(
        session,
        client_id=1,
        scope="subject",
        scope_id="synthetic-subject",
        reason="r" * lifecycle_runtime.HOLD_REASON_MAX,
        actor="Synthetic",
    )
    assert hold is not None
    session.add.assert_called()


def test_hold_reason_rejects_overlong():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_reason_too_long"):
        lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="subject",
            scope_id="synthetic-subject",
            reason="r" * (lifecycle_runtime.HOLD_REASON_MAX + 1),
            actor="Synthetic",
        )
    session.add.assert_not_called()
