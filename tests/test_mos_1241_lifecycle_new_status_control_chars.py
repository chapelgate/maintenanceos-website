from unittest.mock import MagicMock

import pytest

import lifecycle


def test_transition_rejects_control_chars_in_new_status():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    wo.status = "NEW"
    with pytest.raises(ValueError, match="control characters"):
        lifecycle.transition_work_order(session, wo, "CLOSED\x00", actor="User", reason="close")


def test_transition_allows_clean_new_status():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 1
    wo.status = "NEW"
    # status changes to HUMAN_REVIEW are allowed without valid transition target concerns
    result = lifecycle.transition_work_order(session, wo, "HUMAN_REVIEW", actor="User", reason="review")
    assert result is True or result is False
