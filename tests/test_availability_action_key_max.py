import inspect
from datetime import datetime, timedelta
from unittest.mock import patch

import idempotency
import operations


def test_availability_action_key_uses_action_key_max():
    assert idempotency.ACTION_KEY_MAX == 200
    assert operations.ACTION_KEY_MAX == 200
    source = inspect.getsource(operations.submit_availability)
    assert "ACTION_KEY_MAX" in source


def test_availability_action_key_accepts_bounded_text():
    start = datetime(2026, 1, 1, 9, 0, 0)
    end = start + timedelta(hours=1)
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded action_key must open session")
        try:
            operations.submit_availability(1, 1, start, end, "a" * idempotency.ACTION_KEY_MAX)
        except AssertionError as raised:
            assert "bounded action_key" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded action_key")


def test_availability_action_key_rejects_blank_without_session():
    start = datetime(2026, 1, 1, 9, 0, 0)
    end = start + timedelta(hours=1)
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for blank action_key")
        assert operations.submit_availability(1, 1, start, end, "   ") is None


def test_availability_action_key_rejects_overlong_without_session():
    start = datetime(2026, 1, 1, 9, 0, 0)
    end = start + timedelta(hours=1)
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong action_key")
        assert operations.submit_availability(1, 1, start, end, "a" * (idempotency.ACTION_KEY_MAX + 1)) is None
