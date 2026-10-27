from unittest.mock import patch

import phone_normalise
import channels


def test_phone_max_is_50():
    assert phone_normalise.PHONE_MAX == 50


def test_phone_accepts_bounded_normalised():
    assert phone_normalise.normalise_phone("07123 456789") == "+447123456789"
    assert phone_normalise.normalise_phone("0" * phone_normalise.PHONE_MAX) == "0" * phone_normalise.PHONE_MAX


def test_phone_rejects_overlong_raw_and_normalised():
    assert phone_normalise.normalise_phone("0" * (phone_normalise.PHONE_MAX + 1)) == ""
    assert phone_normalise.normalise_phone("07" + "1" * phone_normalise.PHONE_MAX) == ""
    assert phone_normalise.normalise_phone("") == ""
    assert phone_normalise.normalise_phone(None) == ""


def test_resident_by_phone_rejects_overlong_without_session():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for invalid phone")
        assert channels.resident_by_phone("0" * (phone_normalise.PHONE_MAX + 1), client_id=1) is None
        assert channels.resident_by_phone("", client_id=1) is None
