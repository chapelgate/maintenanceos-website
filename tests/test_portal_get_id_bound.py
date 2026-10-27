import inspect

import pytest
from fastapi import HTTPException

import api


def test_portal_get_handlers_revalidate_ids():
    for fn in (api.contractor_decision, api.availability_form, api.complete_form):
        source = inspect.getsource(fn)
        assert '_positive_int(work_order_id,"work_order_id")' in source
        assert '_positive_int(contractor_id,"contractor_id")' in source


@pytest.mark.parametrize("fn", [api.contractor_decision, api.availability_form, api.complete_form])
def test_portal_get_rejects_oversize_ids(fn, monkeypatch):
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")
    with pytest.raises(HTTPException) as exc:
        if fn is api.contractor_decision:
            fn(api.POSITIVE_INT_MAX + 1, 1, "accept", "token")
        else:
            fn(api.POSITIVE_INT_MAX + 1, 1, "token")
    assert exc.value.status_code == 400
