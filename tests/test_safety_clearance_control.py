import inspect
from unittest.mock import MagicMock

import pytest

import safety_controls


def test_clear_critical_safety_source_rejects_control_chars():
    source = inspect.getsource(safety_controls.clear_critical_safety)
    assert "control characters" in source


def test_clear_critical_safety_rejects_control_chars_before_db():
    session = MagicMock()
    with pytest.raises(safety_controls.SafetyStateError, match="control characters"):
        safety_controls.clear_critical_safety(
            session,
            1,
            actor_user_id=1,
            reason="cleared\x00ok",
            client_id=1,
        )
    session.get.assert_not_called()
