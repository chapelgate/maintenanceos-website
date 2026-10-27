import inspect
from unittest.mock import MagicMock

import pytest

import lifecycle


def test_transition_work_order_source_rejects_control_chars():
    source = inspect.getsource(lifecycle.transition_work_order)
    assert "transition control characters" in source


def test_transition_work_order_rejects_control_chars_in_reason():
    wo = MagicMock()
    wo.status = "NEW"
    wo.id = 1
    session = MagicMock()
    with pytest.raises(ValueError, match="transition control characters"):
        lifecycle.transition_work_order(
            session,
            wo,
            "HUMAN_REVIEW",
            actor="User:1",
            reason="bad\x00reason",
        )
    assert wo.status == "NEW"


def test_transition_work_order_rejects_control_chars_in_actor():
    wo = MagicMock()
    wo.status = "NEW"
    wo.id = 1
    session = MagicMock()
    with pytest.raises(ValueError, match="transition control characters"):
        lifecycle.transition_work_order(
            session,
            wo,
            "HUMAN_REVIEW",
            actor="User:\x001",
            reason="valid reason text here",
        )
    assert wo.status == "NEW"
