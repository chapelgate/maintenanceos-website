import postcode_normalise


def test_postcode_max_is_20():
    assert postcode_normalise.POSTCODE_MAX == 20


def test_postcode_accepts_bounded_text():
    assert postcode_normalise.normalise_postcode("CH45 2AB") == "CH452AB"
    assert postcode_normalise.normalise_postcode("A" * postcode_normalise.POSTCODE_MAX) == "A" * postcode_normalise.POSTCODE_MAX
    assert postcode_normalise.postcode_matches("CH45 2AB", "ch45 2ab")


def test_postcode_rejects_overlong():
    assert postcode_normalise.normalise_postcode("A" * (postcode_normalise.POSTCODE_MAX + 1)) == ""
    assert not postcode_normalise.postcode_matches("CH45 2AB", "A" * (postcode_normalise.POSTCODE_MAX + 1))
    assert not postcode_normalise.postcode_matches("", "CH45 2AB")
