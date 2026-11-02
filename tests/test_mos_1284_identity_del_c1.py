from identity import normalise_phone, normalise_postcode, postcode_matches


def test_normalise_phone_rejects_del_and_c1():
    assert normalise_phone("07\x7f123456789") == ""
    assert normalise_phone("+447700\x80900123") == ""
    assert normalise_phone("+447700\x9f900123") == ""


def test_normalise_postcode_rejects_del_and_c1():
    assert normalise_postcode("CH45\x7f2AB") == ""
    assert normalise_postcode("SW1A\x801AA") == ""
    assert normalise_postcode("SW1A\x9f1AA") == ""


def test_identity_still_accepts_clean():
    assert normalise_phone("07123 456789") == "+447123456789"
    assert normalise_postcode("ch45 2ab") == "CH452AB"
    assert postcode_matches("CH45 2AB", "ch45 2ab") is True
