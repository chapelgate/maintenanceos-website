from postcode_normalise import is_synthetic_test_postcode


def test_zz_postcodes_are_synthetic():
    assert is_synthetic_test_postcode("ZZ9 9ZZ") is True
    assert is_synthetic_test_postcode("zz99zz") is True


def test_live_looking_postcodes_are_not_synthetic():
    assert is_synthetic_test_postcode("SW1A 1AA") is False
    assert is_synthetic_test_postcode("CH45 1AB") is False
    assert is_synthetic_test_postcode("") is False
