import inspect

import pytest
from fastapi import HTTPException

import api


def test_safety_clearance_reason_rejects_control_chars():
    source = inspect.getsource(api.safety_clearance)
    assert "_reject_control_chars" in source
    assert "SAFETY_CLEARANCE_REASON_MAX" in source


def test_reject_control_chars_on_safety_reason():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x00bad", "reason")
    assert exc.value.status_code == 400
