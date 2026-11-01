from postcode_normalise import normalise_postcode, postcode_matches


def test_rejects_control_chars_in_postcode_matches():
    assert postcode_matches("EX\x01PECTED", "SUPP\x02LIED") is False


def test_rejects_control_chars_in_either_arg():
    assert postcode_matches("EXPECTED", "SUPP\x02LIED") is False
    assert postcode_matches("EX\x01PECTED", "SUPPLIED") is False


def test_accepts_clean():
    assert postcode_matches("EXPECTED", "EXPECTED") is True


def test_normalise_postcode_rejects_control():
    assert normalise_postcode("EXPECTED\x00") == ""
    assert normalise_postcode("\x01\x02") == ""


def test_normalise_postcode_clean():
    assert normalise_postcode("EXPECTED") == "EXPECTED"
    assert normalise_postcode("") == ""
