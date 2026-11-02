from unittest.mock import MagicMock

import pytest

from lifecycle import transition_work_order


def _wo(status="OPEN"):
    wo = MagicMock()
    wo.id = 1
    wo.status = status
    return wo


def test_transition_rejects_del_in_new_status():
    session = MagicMock()
    with pytest.raises(ValueError, match="control characters"):
        transition_work_order(session, _wo(), "OPEN\x7f", actor="ops", reason="ok")


def test_transition_rejects_c1_in_actor_and_reason():
    session = MagicMock()
    with pytest.raises(ValueError, match="control characters"):
        transition_work_order(session, _wo(), "IN_PROGRESS", actor="ops\x80", reason="ok")
    with pytest.raises(ValueError, match="control characters"):
        transition_work_order(session, _wo(), "IN_PROGRESS", actor="ops", reason="move\x9fon")


def test_transition_accepts_clean_same_status():
    session = MagicMock()
    assert transition_work_order(session, _wo("OPEN"), "OPEN", actor="ops", reason="noop") is False
