from phone_normalise import is_e164_phone


def test_valid_e164_phones():
    assert is_e164_phone("+447700900123") is True
    assert is_e164_phone("07700900123") is True


def test_invalid_phones():
    assert is_e164_phone("") is False
    assert is_e164_phone("not-a-phone") is False
    assert is_e164_phone("+0123") is False
    assert is_e164_phone("+" + "1" * 20) is False
