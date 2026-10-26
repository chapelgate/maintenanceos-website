import inspect
from unittest.mock import patch

import pytest

import channels


def test_channel_source_max_is_30():
    assert channels.CHANNEL_SOURCE_MAX == 30
    source = inspect.getsource(channels.create_from_channel)
    assert "CHANNEL_SOURCE_MAX" in source
    assert "source is too long" in source


def test_channel_source_accepts_bounded_text():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded source must not open session in this unit test")
        with pytest.raises(AssertionError, match="bounded source"):
            channels.create_from_channel(
                1, 1, 1, "S" * channels.CHANNEL_SOURCE_MAX, "tap dripping"
            )


def test_channel_source_rejects_overlong():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong source")
        with pytest.raises(ValueError, match="source is too long"):
            channels.create_from_channel(
                1,
                1,
                1,
                "S" * (channels.CHANNEL_SOURCE_MAX + 1),
                "tap dripping",
            )
