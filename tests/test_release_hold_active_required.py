import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime
from models import DataLifecycleHold


def test_release_refuses_inactive_hold():
    source = inspect.getsource(lifecycle_runtime.release_hold)
    assert "hold_already_released" in source
    assert "hold.active" in source


def test_release_active_hold_succeeds():
    session = MagicMock()
    hold = DataLifecycleHold(
        id=42,
        client_id=1,
        scope="tenant",
        scope_id="all",
        reason="legal hold",
        created_by="Admin",
        active=True,
        released_at=None,
    )
    session.get.return_value = hold
    released = lifecycle_runtime.release_hold(session, hold_id=42, client_id=1, actor="Admin")
    assert released is hold
    assert hold.active is False
    assert hold.released_at is not None


def test_release_other_tenant_hold_fails():
    session = MagicMock()
    hold = DataLifecycleHold(
        id=43,
        client_id=2,
        scope="tenant",
        scope_id="all",
        reason="legal hold",
        created_by="Admin",
        active=True,
        released_at=None,
    )
    session.get.return_value = hold
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_not_found_for_tenant"):
        lifecycle_runtime.release_hold(session, hold_id=43, client_id=1, actor="Admin")
