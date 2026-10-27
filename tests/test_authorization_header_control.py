import inspect

import pytest
from fastapi import HTTPException

import api


def test_require_internal_api_rejects_control_chars():
    source = inspect.getsource(api.require_internal_api)
    assert "_reject_control_chars" in source


def test_reject_control_chars_on_authorization():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("Bearer \x00tok", "Authorization")
    assert exc.value.status_code == 400