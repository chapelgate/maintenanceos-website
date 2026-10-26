import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_hold_scope_id_max_is_200():
    assert lifecycle_runtime.SCOPE_ID_MAX == 200
    source = inspect.getsource(lifecycle_runtime.create_hold)
    assert "SCOPE_ID_MAX" in source
    assert "hold_scope_id_too_long" in source


def test_hold_scope_id_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock()
    hold = lifecycle_runtime.create_hold(
        session,
        client_id=1,
        scope="subject",
        scope_id="s" * lifecycle_runtime.SCOPE_ID_MAX,
        reason="synthetic hold",
        actor="Synthetic",
    )
    assert hold is not None
    session.add.assert_called()


def test_hold_scope_id_rejects_overlong():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_scope_id_too_long"):
        lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="subject",
            scope_id="s" * (lifecycle_runtime.SCOPE_ID_MAX + 1),
            reason="synthetic hold",
            actor="Synthetic",
        )
    session.add.assert_not_called()
