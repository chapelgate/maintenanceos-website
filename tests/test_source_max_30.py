import inspect

import pytest
from fastapi import HTTPException

import api


def test_work_order_source_max_is_30():
    assert api.WORK_ORDER_SOURCE_MAX == 30
    source = inspect.getsource(api.create_work_order)
    assert "WORK_ORDER_SOURCE_MAX" in source


def test_work_order_source_accepts_bounded_text():
    assert (
        api._bounded_text(
            "API",
            "source",
            required=True,
            maximum=api.WORK_ORDER_SOURCE_MAX,
        )
        == "API"
    )
    assert (
        api._bounded_text(
            "a" * api.WORK_ORDER_SOURCE_MAX,
            "source",
            required=True,
            maximum=api.WORK_ORDER_SOURCE_MAX,
        )
        == "a" * api.WORK_ORDER_SOURCE_MAX
    )


def test_work_order_source_rejects_empty_and_overlong():
    with pytest.raises(HTTPException) as empty:
        api._bounded_text("", "source", required=True, maximum=api.WORK_ORDER_SOURCE_MAX)
    assert empty.value.status_code == 400
    with pytest.raises(HTTPException) as overlong:
        api._bounded_text(
            "a" * (api.WORK_ORDER_SOURCE_MAX + 1),
            "source",
            required=True,
            maximum=api.WORK_ORDER_SOURCE_MAX,
        )
    assert overlong.value.status_code == 400
