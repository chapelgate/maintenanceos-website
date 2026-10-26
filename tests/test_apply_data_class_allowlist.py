import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_apply_checks_supported_runtime_classes():
    source = inspect.getsource(lifecycle_runtime._apply_decision)
    assert "SUPPORTED_RUNTIME_CLASSES" in source
    assert "runtime_class_not_supported" in source


def test_apply_rejects_unknown_data_class():
    session = MagicMock()
    decision = SimpleNamespace(
        action="erase",
        client_id=1,
        data_class="contractor_profile",
        record_id="contractor:1",
        reason="retention_expired",
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError,
            match="runtime_class_not_supported:contractor_profile",
        ):
            lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)
        claim.assert_not_called()


def test_apply_retains_without_class_check():
    session = MagicMock()
    decision = SimpleNamespace(
        action="retain",
        client_id=1,
        data_class="contractor_profile",
        record_id="contractor:1",
        reason="hold",
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        assert lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision) is False
        claim.assert_not_called()
