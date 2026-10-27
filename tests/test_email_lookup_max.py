import inspect
from unittest.mock import patch

import channels


def test_email_lookup_max_matches_resident_model():
    assert channels.EMAIL_LOOKUP_MAX == 320
    source = inspect.getsource(channels.resident_by_email)
    assert "EMAIL_LOOKUP_MAX" in source


def test_email_lookup_accepts_bounded_email():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded email must open session")
        try:
            channels.resident_by_email(1, "a" * channels.EMAIL_LOOKUP_MAX)
        except AssertionError as raised:
            assert "bounded email" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded email")


def test_email_lookup_rejects_blank_and_overlong_without_session():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for invalid email")
        assert channels.resident_by_email(1, "") is None
        assert channels.resident_by_email(1, "   ") is None
        assert channels.resident_by_email(1, "a" * (channels.EMAIL_LOOKUP_MAX + 1)) is None
