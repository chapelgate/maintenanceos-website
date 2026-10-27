import inspect

import pytest
from fastapi import HTTPException

import api


def test_positive_int_max_is_signed_32bit():
    assert api.POSITIVE_INT_MAX == 2_147_483_647
    source = inspect.getsource(api._positive_int)
    assert "POSITIVE_INT_MAX" in source


def test_positive_int_accepts_bounds():
    assert api._positive_int(1, "id") == 1
    assert api._positive_int(api.POSITIVE_INT_MAX, "id") == api.POSITIVE_INT_MAX


@pytest.mark.parametrize("value", [0, -1, api.POSITIVE_INT_MAX + 1, True, "x", None])
def test_positive_int_rejects_invalid(value):
    with pytest.raises(HTTPException) as exc:
        api._positive_int(value, "id")
    assert exc.value.status_code == 400


def test_portal_submit_handlers_revalidate_ids():
    for fn in (api.contractor_decision_submit, api.availability_submit, api.complete_submit):
        source = inspect.getsource(fn)
        assert '_positive_int(work_order_id,"work_order_id")' in source
        assert '_positive_int(contractor_id,"contractor_id")' in source
