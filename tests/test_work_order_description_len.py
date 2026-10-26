import inspect

import pytest
from fastapi import HTTPException

import api


def test_work_order_description_max_is_8000():
    assert api.WORK_ORDER_DESCRIPTION_MAX == 8000
    source = inspect.getsource(api.create_work_order)
    assert "WORK_ORDER_DESCRIPTION_MAX" in source


def test_work_order_description_accepts_bounded_text():
    assert api._bounded_text("leaking tap", "description", maximum=api.WORK_ORDER_DESCRIPTION_MAX) == "leaking tap"
    assert (
        api._bounded_text("a" * api.WORK_ORDER_DESCRIPTION_MAX, "description", maximum=api.WORK_ORDER_DESCRIPTION_MAX)
        == "a" * api.WORK_ORDER_DESCRIPTION_MAX
    )


def test_work_order_description_rejects_empty_and_overlong():
    for bad in ("", "   ", "a" * (api.WORK_ORDER_DESCRIPTION_MAX + 1)):
        with pytest.raises(HTTPException) as raised:
            api._bounded_text(bad, "description", required=True, maximum=api.WORK_ORDER_DESCRIPTION_MAX)
        assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "description", maximum=api.WORK_ORDER_DESCRIPTION_MAX)
    assert typed.value.status_code == 400
