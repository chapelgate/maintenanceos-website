from phone_normalise import is_e164_phone, normalise_phone


def test_normalise_phone_rejects_control_chars():
    assert normalise_phone("07\x00123456789") == ""
    assert normalise_phone("+44\n7700900123") == ""
    assert normalise_phone("07\t700900123") == ""


def test_normalise_phone_accepts_clean_uk_mobile():
    assert normalise_phone("07123 456789") == "+447123456789"
    assert normalise_phone("+447700900123") == "+447700900123"


def test_is_e164_phone_rejects_control_chars():
    assert is_e164_phone("07\x00123456789") is False
    assert is_e164_phone("+44\r7700900123") is False
    assert is_e164_phone("+447700900123") is True
