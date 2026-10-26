import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_release_requires_non_empty_actor():
    source = inspect.getsource(lifecycle_runtime.release_hold)
    assert "release_hold_actor_required" in source
    assert 'actor = (actor or "").strip()' in source
    assert "Lifecycle Controller" not in source


def test_release_accepts_stripped_actor():
    session = MagicMock()
    session.get.side_effect = [
        MagicMock(),  # Client via _require_client
        MagicMock(client_id=1, active=True, id=9),  # hold
    ]
    # _require_client uses session.get(Client, client_id); release then gets hold.
    # Re-bind get to return client for Client lookup then hold.
    client = MagicMock()
    hold = MagicMock(client_id=1, active=True, id=9)

    def _get(model, key):
        name = getattr(model, "__name__", str(model))
        if name == "Client":
            return client
        return hold

    session.get.side_effect = _get
    out = lifecycle_runtime.release_hold(session, 9, client_id=1, actor="  Controller  ")
    assert out is hold
    assert hold.active is False


def test_release_rejects_whitespace_actor():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="release_hold_actor_required"
    ):
        lifecycle_runtime.release_hold(session, 9, client_id=1, actor="   ")
