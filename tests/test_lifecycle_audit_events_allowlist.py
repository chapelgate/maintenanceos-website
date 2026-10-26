import inspect
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_valid_lifecycle_audit_events_known_set():
    assert lifecycle_runtime.VALID_LIFECYCLE_AUDIT_EVENTS == frozenset(
        {
            "DATA_LIFECYCLE_HOLD_CREATED",
            "DATA_LIFECYCLE_HOLD_RELEASED",
            "DATA_LIFECYCLE_SWEEP_QUEUED",
            "DATA_LIFECYCLE_ACTION_APPLIED",
            "DATA_LIFECYCLE_SWEEP_COMPLETED",
        }
    )
    assert "_lifecycle_audit" in inspect.getsource(lifecycle_runtime.create_hold)
    assert "_lifecycle_audit" in inspect.getsource(lifecycle_runtime.release_hold)
    assert "_lifecycle_audit" in inspect.getsource(lifecycle_runtime.queue_retention_sweep)
    assert "_lifecycle_audit" in inspect.getsource(lifecycle_runtime._apply_decision)
    assert "_lifecycle_audit" in inspect.getsource(lifecycle_runtime.execute_lifecycle_sweep)
    helper = inspect.getsource(lifecycle_runtime._lifecycle_audit)
    assert "VALID_LIFECYCLE_AUDIT_EVENTS" in helper
    assert "invalid_lifecycle_audit_event" in helper


def test_create_hold_writes_allowed_audit_event():
    session = MagicMock()
    session.get.return_value = MagicMock()
    with patch.object(lifecycle_runtime, "audit") as mock_audit:
        hold = lifecycle_runtime.create_hold(
            session,
            client_id=1,
            scope="tenant",
            scope_id="1",
            reason="synthetic hold",
            actor="Synthetic",
        )
        assert hold is not None
        mock_audit.assert_called_once()
        event = mock_audit.call_args[0][3]
        assert event == "DATA_LIFECYCLE_HOLD_CREATED"
        assert event in lifecycle_runtime.VALID_LIFECYCLE_AUDIT_EVENTS


def test_lifecycle_audit_rejects_unknown_event():
    session = MagicMock()
    with patch.object(lifecycle_runtime, "audit") as mock_audit:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError, match="invalid_lifecycle_audit_event"
        ):
            lifecycle_runtime._lifecycle_audit(
                session, None, "Synthetic", "NOT_A_LIFECYCLE_EVENT", "{}"
            )
        mock_audit.assert_not_called()
