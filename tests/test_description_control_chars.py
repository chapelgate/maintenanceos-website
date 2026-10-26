import inspect

import pytest
from fastapi import HTTPException

import api


def test_reject_control_chars_helper_exists():
    source = inspect.getsource(api.create_work_order)
    assert "_reject_control_chars" in source
    assert "description" in source


def test_description_accepts_plain_text():
    assert api._reject_control_chars("leaking tap", "description") == "leaking tap"
    assert api._reject_control_chars("line1\nline2", "description") == "line1\nline2"


def test_description_rejects_control_chars():
    for bad in ("\x00leak", "leak\x01", "\x1ftext"):
        with pytest.raises(HTTPException) as raised:
            api._reject_control_chars(bad, "description")
        assert raised.value.status_code == 400
        assert "control characters" in raised.value.detail
