import pytest

from security import SIGNED_LINK_KINDS, sign_link, verify_link


def test_signed_link_kinds_are_the_existing_set():
    assert SIGNED_LINK_KINDS == frozenset({"accept", "decline", "availability", "complete", "voice_stream"})


def test_existing_kinds_still_round_trip(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    for kind, subject in (
        ("accept", 3),
        ("decline", 3),
        ("availability", 3),
        ("complete", 3),
        ("voice_stream", "CA-auth"),
    ):
        token = sign_link(kind, 10, subject)
        assert verify_link(kind, 10, subject, token)
        assert not verify_link("accept" if kind != "accept" else "decline", 10, subject, token)


def test_unknown_link_kind_fails_closed(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    for kind in ("", "admin", "javascript", "voice", None):
        with pytest.raises(ValueError):
            sign_link(kind, 10, 3)
        assert verify_link(kind, 10, 3, "1.not-a-token") is False
