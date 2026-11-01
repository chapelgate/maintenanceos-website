from identity import normalise_phone, normalise_postcode, postcode_matches


def test_normalise_postcode_rejects_overlong_and_control():
    assert normalise_postcode("x" * 50) == ""
    assert normalise_postcode("CH45\x002AB") == ""


def test_normalise_phone_rejects_overlong_and_control():
    assert normalise_phone("+" + "1" * 60) == ""
    assert normalise_phone("07\x00123456789") == ""


def test_existing_matches_still_work():
    assert postcode_matches("CH45 2AB", "ch45 2ab")
    assert normalise_phone("07123 456789") == "+447123456789"
