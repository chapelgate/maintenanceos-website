import inspect

import pytest
from fastapi import HTTPException

import api


def test_confirm_rejects_control_chars_in_comment():
    source = inspect.getsource(api.confirm)
    assert "_reject_control_chars" in source
    assert "RESIDENT_COMMENT_MAX" in source


def test_reject_control_chars_on_comment():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x01bad", "comment")
    assert exc.value.status_code == 400
