import inspect
from unittest.mock import patch

import pytest

import channels


def test_channel_event_key_max_is_200():
    assert channels.EVENT_KEY_MAX == 200
    source = inspect.getsource(channels.create_from_channel)
    assert "EVENT_KEY_MAX" in source
    assert "event_key is too long" in source


def test_channel_event_key_accepts_bounded_text():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded event_key must not open session in this unit test")
        with pytest.raises(AssertionError, match="bounded event_key"):
            channels.create_from_channel(
                1, 1, 1, "SMS", "tap dripping", event_key="e" * channels.EVENT_KEY_MAX
            )
        with pytest.raises(AssertionError, match="bounded event_key"):
            channels.create_from_channel(1, 1, 1, "SMS", "tap dripping", event_key="")


def test_channel_event_key_rejects_overlong():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong event_key")
        with pytest.raises(ValueError, match="event_key is too long"):
            channels.create_from_channel(
                1,
                1,
                1,
                "SMS",
                "tap dripping",
                event_key="e" * (channels.EVENT_KEY_MAX + 1),
            )
