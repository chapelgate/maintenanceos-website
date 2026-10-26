import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_apply_requires_reason():
    source = inspect.getsource(lifecycle_runtime._apply_decision)
    assert "lifecycle_decision_reason_required" in source


def test_apply_rejects_blank_reason():
    session = MagicMock()
    decision = SimpleNamespace(
        action="erase",
        client_id=1,
        data_class="work_order_closed",
        record_id="work_order:1",
        reason="   ",
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        with pytest.raises(
            lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_decision_reason_required"
        ):
            lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)
        claim.assert_not_called()


def test_apply_retains_without_reason_check():
    session = MagicMock()
    decision = SimpleNamespace(
        action="retain",
        client_id=1,
        data_class="work_order_closed",
        record_id="work_order:1",
        reason="",
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        assert (
            lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)
            is False
        )
        claim.assert_not_called()
