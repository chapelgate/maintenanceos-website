import pytest

import channels


def test_canonical_incident_key_rejects_del_and_c1():
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.canonical_incident_key(1, 2, 3, "desc\x7f")
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.canonical_incident_key(1, 2, 3, "desc\x80")
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.canonical_incident_key(1, 2, 3, "desc\x9f")


def test_create_from_channel_rejects_del_and_c1_in_participant():
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.create_from_channel(1, 2, 3, "email", "desc", participant="part\x7f")
    with pytest.raises(ValueError, match="control characters not allowed"):
        channels.create_from_channel(1, 2, 3, "email", "desc", participant="part\x80")


def test_resident_by_email_rejects_del_and_c1():
    assert channels.resident_by_email(1, "bad\x7f@example.com") is None
    assert channels.resident_by_email(1, "bad\x80@example.com") is None


def test_clean_inputs_still_work():
    key = channels.canonical_incident_key(1, 2, 3, "Caller: hello")
    assert key.startswith("daily:")
