import inspect
from unittest.mock import patch

import idempotency
import operations


def test_appointment_event_key_uses_action_key_max():
    assert idempotency.ACTION_KEY_MAX == 200
    source = inspect.getsource(operations.confirm_appointment)
    assert "ACTION_KEY_MAX" in source


def test_appointment_event_key_accepts_bounded_text():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded event_key must open session")
        try:
            operations.confirm_appointment(1, 1, "e" * idempotency.ACTION_KEY_MAX)
        except AssertionError as raised:
            assert "bounded event_key" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded event_key")


def test_appointment_event_key_rejects_overlong_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong event_key")
        assert operations.confirm_appointment(1, 1, "e" * (idempotency.ACTION_KEY_MAX + 1)) is False
