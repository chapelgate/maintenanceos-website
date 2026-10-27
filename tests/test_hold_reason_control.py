import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_create_hold_source_rejects_control_chars():
    source = inspect.getsource(lifecycle_runtime.create_hold)
    assert "reason_has_control_chars" in source


def test_release_hold_source_rejects_control_chars():
    source = inspect.getsource(lifecycle_runtime.release_hold)
    assert "reason_has_control_chars" in source


def test_create_hold_rejects_control_chars_in_reason():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_control_chars"):
        lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="subject",
            scope_id="synthetic-subject",
            reason="bad\x00reason",
            actor="Synthetic",
        )


def test_create_hold_rejects_control_chars_in_actor():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="hold_control_chars"):
        lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="subject",
            scope_id="synthetic-subject",
            reason="valid reason text",
            actor="Syn\x00thetic",
        )
