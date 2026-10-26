import inspect
from unittest.mock import patch

import pytest

import channels


def test_media_url_max_is_2000():
    assert channels.MEDIA_URL_MAX == 2000
    source = inspect.getsource(channels.create_from_channel)
    assert "MEDIA_URL_MAX" in source
    assert "media_url is too long" in source


def test_media_url_accepts_bounded_text():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded media_url must not open session in this unit test")
        with pytest.raises(AssertionError, match="bounded media_url"):
            channels.create_from_channel(
                1,
                1,
                1,
                "SMS",
                "tap dripping",
                media_url="https://example.com/" + ("a" * 20),
            )
        with pytest.raises(AssertionError, match="bounded media_url"):
            channels.create_from_channel(1, 1, 1, "SMS", "tap dripping", media_url="")


def test_media_url_rejects_overlong():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong media_url")
        with pytest.raises(ValueError, match="media_url is too long"):
            channels.create_from_channel(
                1,
                1,
                1,
                "SMS",
                "tap dripping",
                media_url="https://example.com/" + ("a" * channels.MEDIA_URL_MAX),
            )
