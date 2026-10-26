import inspect

import pytest
from fastapi import HTTPException

import api


def test_completion_note_max_is_4000():
    assert api.COMPLETION_NOTE_MAX == 4000
    source = inspect.getsource(api.complete_submit)
    assert "normalize_completion_note" in source


def test_completion_note_strips_and_accepts_bounded_text():
    assert api.normalize_completion_note("  boiler isolated and repaired  ") == "boiler isolated and repaired"
    assert api.normalize_completion_note("a" * api.COMPLETION_NOTE_MAX) == "a" * api.COMPLETION_NOTE_MAX


def test_completion_note_rejects_empty_and_overlong():
    for bad in ("", "   ", "a" * (api.COMPLETION_NOTE_MAX + 1)):
        with pytest.raises(HTTPException) as raised:
            api.normalize_completion_note(bad)
        assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api.normalize_completion_note(123)
    assert typed.value.status_code == 400
