import inspect
from datetime import datetime, timedelta
from unittest.mock import patch

import operations


def test_accept_source_rejects_control_chars():
    source = inspect.getsource(operations.accept_contractor)
    assert "reason_has_control_chars" in source


def test_decline_source_rejects_control_chars():
    source = inspect.getsource(operations.decline_contractor)
    assert "reason_has_control_chars" in source


def test_availability_source_rejects_control_chars():
    source = inspect.getsource(operations.submit_availability)
    assert "reason_has_control_chars" in source


def test_completion_source_rejects_control_chars():
    source = inspect.getsource(operations.submit_completion)
    assert "reason_has_control_chars" in source


def test_confirm_source_rejects_control_chars():
    source = inspect.getsource(operations.confirm_appointment)
    assert "reason_has_control_chars" in source


def test_accept_rejects_control_chars_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for control action_key")
        assert operations.accept_contractor(1, 1, "ok\x00key") is False


def test_decline_rejects_control_chars_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for control action_key")
        assert operations.decline_contractor(1, 1, "ok\x01key") is False


def test_availability_rejects_control_chars_without_session():
    start = datetime(2026, 10, 28, 9, 0)
    end = start + timedelta(hours=1)
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for control action_key")
        assert operations.submit_availability(1, 1, start, end, "ok\x02key") is None


def test_completion_rejects_control_chars_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for control action_key")
        assert operations.submit_completion(1, 1, "done", "", "ok\x03key") is None


def test_confirm_rejects_control_chars_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for control event_key")
        assert operations.confirm_appointment(1, 1, "ok\x04key") is False
