import inspect

import pytest
from fastapi import HTTPException

import api


def test_availability_submit_rejects_control_chars():
    source = inspect.getsource(api.availability_submit)
    assert '_reject_control_chars(start' in source


def test_reject_control_chars_on_availability_start():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("2026\x00-01-01T10:00", "start")
    assert exc.value.status_code == 400


def test_reject_control_chars_on_availability_end():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("2026-01-01T10:\x000", "end")
    assert exc.value.status_code == 400