import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_apply_checks_decision_client_id():
    source = inspect.getsource(lifecycle_runtime._apply_decision)
    assert "lifecycle_decision_tenant_mismatch" in source
    assert "decision.client_id != client_id" in source


def test_apply_rejects_cross_tenant_decision():
    session = MagicMock()
    decision = SimpleNamespace(
        action="erase",
        client_id=99,
        data_class="work_order_closed",
        record_id="work_order:1",
        reason="retention_expired",
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_decision_tenant_mismatch"
        ):
            lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)
        claim.assert_not_called()


def test_apply_retains_without_tenant_check():
    session = MagicMock()
    decision = SimpleNamespace(
        action="retain",
        client_id=99,
        data_class="work_order_closed",
        record_id="work_order:1",
        reason="hold",
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        assert (
            lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)
            is False
        )
        claim.assert_not_called()
