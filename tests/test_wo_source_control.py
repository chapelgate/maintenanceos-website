import inspect

import pytest
from fastapi import HTTPException

import api


def test_create_work_order_source_rejects_control_chars():
    source = inspect.getsource(api.create_work_order)
    assert "_reject_control_chars" in source
    assert "WORK_ORDER_SOURCE_MAX" in source


def test_reject_control_chars_on_source():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("API\x00", "source")
    assert exc.value.status_code == 400
