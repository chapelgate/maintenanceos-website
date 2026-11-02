from postcode_normalise import normalise_postcode, postcode_matches


def test_normalise_postcode_rejects_del():
    assert normalise_postcode("CH45\x7f2AB") == ""
    assert normalise_postcode("SW1A\x7f1AA") == ""


def test_normalise_postcode_rejects_c1():
    assert normalise_postcode("CH45\x802AB") == ""
    assert normalise_postcode("SW1A\x9f1AA") == ""


def test_normalise_postcode_accepts_clean():
    assert normalise_postcode("ch45 2ab") == "CH452AB"
    assert normalise_postcode("SW1A 1AA") == "SW1A1AA"


def test_postcode_matches_rejects_del_and_c1():
    assert postcode_matches("CH45\x7f2AB", "CH452AB") is False
    assert postcode_matches("CH452AB", "CH45\x802AB") is False
    assert postcode_matches("CH45 2AB", "ch45 2ab") is True
