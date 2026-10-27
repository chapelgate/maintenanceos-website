from postcode_normalise import normalise_postcode, postcode_matches, POSTCODE_MAX


def test_postcode_max_is_20():
    assert POSTCODE_MAX == 20


def test_postcode_accepts_bounded():
    assert normalise_postcode("SW1A 1AA") == "SW1A 1AA"
    assert normalise_postcode("  sw1a1aa  ") == "SW1A 1AA"
    assert normalise_postcode("M1 1AE") == "M1 1AE"
    assert normalise_postcode("X" * POSTCODE_MAX) == normalise_postcode("X" * POSTCODE_MAX)


def test_postcode_rejects_overlong():
    assert normalise_postcode("X" * (POSTCODE_MAX + 1)) == ""
    assert normalise_postcode("") == ""
    assert normalise_postcode(None) == ""


def test_postcode_matches_false_on_overlong():
    assert postcode_matches("SW1A 1AA", "X" * (POSTCODE_MAX + 1)) is False
    assert postcode_matches("X" * (POSTCODE_MAX + 1), "SW1A 1AA") is False
