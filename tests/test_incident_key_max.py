import inspect
from unittest.mock import patch

import pytest

import channels


def test_incident_key_max_is_200():
    assert channels.INCIDENT_KEY_MAX == 200
    source = inspect.getsource(channels.create_from_channel)
    assert "INCIDENT_KEY_MAX" in source
    assert "incident_key is too long" in source


def test_incident_key_accepts_bounded_text():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded incident_key must not open session in this unit test")
        with pytest.raises(AssertionError, match="bounded incident_key"):
            channels.create_from_channel(
                1, 1, 1, "SMS", "tap dripping", incident_key="i" * channels.INCIDENT_KEY_MAX
            )


def test_incident_key_rejects_overlong():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong incident_key")
        with pytest.raises(ValueError, match="incident_key is too long"):
            channels.create_from_channel(
                1,
                1,
                1,
                "SMS",
                "tap dripping",
                incident_key="i" * (channels.INCIDENT_KEY_MAX + 1),
            )
