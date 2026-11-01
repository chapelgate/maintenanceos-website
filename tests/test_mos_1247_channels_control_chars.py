import channels
import pytest


def test_canonical_incident_key_rejects_control_chars():
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.canonical_incident_key(1, 2, 3, "desc\x00")


def test_create_from_channel_rejects_control_chars():
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.create_from_channel(1, 2, 3, "email", "desc\x00")


def test_create_from_channel_rejects_control_chars_in_participant():
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.create_from_channel(1, 2, 3, "email", "desc", participant="part\x00")


def test_clean_inputs_work():
    # Should not raise - minimal valid call
    key = channels.canonical_incident_key(1, 2, 3, "Caller: hello")
    assert key.startswith("daily:")
