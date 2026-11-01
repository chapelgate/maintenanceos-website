from unittest.mock import MagicMock

import channels as ch


def test_resident_by_email_rejects_malformed(monkeypatch):
    session = MagicMock()
    monkeypatch.setattr(ch, "SessionLocal", lambda: session)
    assert ch.resident_by_email(1, "test\x00@example.com") is None
    assert ch.resident_by_email(1, "not-an-email") is None
    assert ch.resident_by_email(1, "a@b@c.com") is None
    assert ch.resident_by_email(1, "test@") is None
    assert ch.resident_by_email(1, "test@domain") is None
    session.query.assert_not_called()


def test_resident_by_email_accepts_valid(monkeypatch):
    session = MagicMock()
    session.__enter__ = MagicMock(return_value=session)
    session.__exit__ = MagicMock(return_value=False)
    session.query.return_value.filter_by.return_value.first.return_value = MagicMock(id=42)
    monkeypatch.setattr(ch, "SessionLocal", lambda: session)
    assert ch.resident_by_email(1, "valid@test.example") == 42


def test_resident_by_email_length_cap(monkeypatch):
    session = MagicMock()
    monkeypatch.setattr(ch, "SessionLocal", lambda: session)
    long_email = "a" * (ch.EMAIL_LOOKUP_MAX) + "@test.com"
    assert ch.resident_by_email(1, long_email) is None
    session.query.assert_not_called()
