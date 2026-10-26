import inspect
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest

import lifecycle_runtime


def test_apply_actions_frozenset():
    assert lifecycle_runtime._APPLY_ACTIONS == frozenset({"erase", "preserve_minimal"})
    source = inspect.getsource(lifecycle_runtime._apply_decision)
    assert "lifecycle_action_invalid" in source


def test_apply_rejects_unknown_action():
    session = MagicMock()
    decision = SimpleNamespace(
        action="delete_all", data_class="work_order_closed", record_id="work_order:1", reason="x"
    )
    with pytest.raises(
        lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_action_invalid:delete_all"
    ):
        lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)


def test_apply_retains_without_claim():
    session = MagicMock()
    decision = SimpleNamespace(
        action="retain", data_class="work_order_closed", record_id="work_order:1", reason="hold"
    )
    with patch.object(lifecycle_runtime, "claim_action") as claim:
        assert (
            lifecycle_runtime._apply_decision(session, client_id=1, job_id=2, decision=decision)
            is False
        )
        claim.assert_not_called()
