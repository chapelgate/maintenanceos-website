import inspect

import pytest
from fastapi import HTTPException

import api


def test_normalize_completion_note_rejects_control_chars():
    source = inspect.getsource(api.normalize_completion_note)
    assert "_reject_control_chars" in source
    assert "COMPLETION_NOTE_MAX" in source


def test_completion_note_control_chars_raise():
    with pytest.raises(HTTPException) as exc:
        api.normalize_completion_note("ok\x00bad")
    assert exc.value.status_code == 400
