import inspect
from unittest.mock import patch

import pytest

import channels


def test_participant_max_is_320():
    assert channels.PARTICIPANT_MAX == 320
    source = inspect.getsource(channels.create_from_channel)
    assert "PARTICIPANT_MAX" in source
    assert "participant is too long" in source


def test_participant_accepts_bounded_text():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded participant must not open session in this unit test")
        with pytest.raises(AssertionError, match="bounded participant"):
            channels.create_from_channel(
                1, 1, 1, "SMS", "tap dripping", participant="a" * channels.PARTICIPANT_MAX
            )
        with pytest.raises(AssertionError, match="bounded participant"):
            channels.create_from_channel(1, 1, 1, "SMS", "tap dripping", participant="")


def test_participant_rejects_overlong():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong participant")
        with pytest.raises(ValueError, match="participant is too long"):
            channels.create_from_channel(
                1,
                1,
                1,
                "SMS",
                "tap dripping",
                participant="a" * (channels.PARTICIPANT_MAX + 1),
            )
