import inspect
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_valid_hold_scopes_known_set():
    assert lifecycle_runtime.VALID_HOLD_SCOPES == frozenset(
        {"tenant", "record", "subject", "data_class"}
    )
    source = inspect.getsource(lifecycle_runtime.create_hold)
    assert "VALID_HOLD_SCOPES" in source
    assert "invalid_hold_scope" in source


def test_create_hold_writes_allowed_scope():
    session = MagicMock()
    session.get.return_value = MagicMock()
    hold = lifecycle_runtime.create_hold(
        session,
        client_id=1,
        scope="tenant",
        scope_id="1",
        reason="Synthetic hold",
        actor="Synthetic",
    )
    assert hold.scope == "tenant"
    assert hold.scope in lifecycle_runtime.VALID_HOLD_SCOPES
    assert session.add.call_count >= 1


def test_create_hold_rejects_unknown_scope():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="invalid_hold_scope"):
        lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="unknown",
            scope_id="1",
            reason="Synthetic hold",
            actor="Synthetic",
        )
    session.add.assert_not_called()
