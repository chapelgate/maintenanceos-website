from phone_normalise import is_e164_phone, normalise_phone


def test_normalise_phone_rejects_del():
    assert normalise_phone("07\x7f123456789") == ""
    assert normalise_phone("+447700\x7f900123") == ""


def test_normalise_phone_rejects_c1():
    assert normalise_phone("07\x80123456789") == ""
    assert normalise_phone("+447700\x9f900123") == ""
    assert normalise_phone("07\x85123456789") == ""


def test_normalise_phone_still_accepts_clean_uk_mobile():
    assert normalise_phone("07123 456789") == "+447123456789"
    assert normalise_phone("+447700900123") == "+447700900123"


def test_is_e164_phone_rejects_del_and_c1():
    assert is_e164_phone("07\x7f123456789") is False
    assert is_e164_phone("+44\x807700900123") is False
    assert is_e164_phone("+447700900123") is True
