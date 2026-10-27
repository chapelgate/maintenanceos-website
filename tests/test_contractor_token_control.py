import inspect

import pytest
from fastapi import HTTPException

import api


def test_require_contractor_token_rejects_control_chars():
    source = inspect.getsource(api._require_contractor_token)
    assert "_reject_control_chars" in source


def test_reject_control_chars_on_token():
    with pytest.raises(HTTPException) as exc:
        api._require_contractor_token("tok\x00en")
    assert exc.value.status_code == 400
