from identity import normalise_phone,postcode_matches
def test_phone():
    assert normalise_phone("07123 456789")=="+447123456789"
    assert normalise_phone("0044 7123 456789")=="+447123456789"
def test_postcode():
    assert postcode_matches("CH45 2AB","ch45 2ab")
    assert not postcode_matches("CH45 2AB","CH46 2AB")
