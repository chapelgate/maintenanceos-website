import pytest
from fastapi import HTTPException

import api

_CHARS = ["\u2061", "\u2062", "\u2063", "\u2064", "\u061c", "\u180e", "\ufff9", "\ufffc", "\ufffd"]


@pytest.mark.parametrize("ch", _CHARS)
def test_reject_invisible_format_chars(ch):
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars(f"left{ch}right", "note")
    assert exc.value.status_code == 400
    assert "control characters" in exc.value.detail


def test_invisible_format_constant_locked():
    assert api._INVISIBLE_FORMAT == frozenset(_CHARS)


def test_plain_text_still_allowed():
    assert api._reject_control_chars("plain note", "note") == "plain note"
