import inspect
from unittest.mock import MagicMock

import pytest

import safety_controls


def test_latch_critical_safety_source_rejects_control_chars():
    source = inspect.getsource(safety_controls.latch_critical_safety)
    assert "control characters" in source


def test_latch_critical_safety_rejects_control_chars_in_actor():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.latch_critical_safety(session, wo, [{"code": "GAS"}], "User" + chr(0) + "1")
