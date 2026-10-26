import pytest
from fastapi import HTTPException

import api


def test_amount_max_is_one_million():
    assert api.AMOUNT_MAX == 1_000_000


def test_positive_amount_accepts_bounded_values():
    assert api._positive_amount(0.01) == 0.01
    assert api._positive_amount(250) == 250.0
    assert api._positive_amount(api.AMOUNT_MAX) == float(api.AMOUNT_MAX)


def test_positive_amount_rejects_overlarge():
    with pytest.raises(HTTPException) as raised:
        api._positive_amount(api.AMOUNT_MAX + 0.01)
    assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as huge:
        api._positive_amount(1e20)
    assert huge.value.status_code == 400
