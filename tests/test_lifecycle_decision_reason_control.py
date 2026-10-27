import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle_runtime


def test_apply_decision_source_rejects_control_chars():
    source = inspect.getsource(lifecycle_runtime._apply_decision)
    assert "reason_has_control_chars" in source
    assert "lifecycle_decision_control_chars" in source


def test_apply_decision_rejects_control_chars_in_reason():
    session = MagicMock()
    session.get.return_value = MagicMock(client_id=1)
    
    # Mock the decision object
    class Decision:
        def __init__(self, action, reason, record_id, client_id, data_class):
            self.action = action
            self.reason = reason
            self.record_id = record_id
            self.client_id = client_id
            self.data_class = data_class
    
    decision = Decision(
        action="erase",
        reason="bad" + chr(0) + "reason",
        record_id="work_order:1",
        client_id=1,
        data_class="work_order_closed",
    )
    
    with pytest.raises(lifecycle_runtime.LifecycleRuntimeError, match="lifecycle_decision_control_chars"):
        lifecycle_runtime._apply_decision(session, client_id=1, job_id=1, decision=decision)
