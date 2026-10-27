import pytest
from fastapi import HTTPException

import api


def test_reject_del_character():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x7f", "note")
    assert exc.value.status_code == 400
    assert "control characters" in exc.value.detail


@pytest.mark.parametrize("ch", ["\u202a", "\u202b", "\u202c", "\u202d", "\u202e", "\u2066", "\u2067", "\u2068", "\u2069"])
def test_reject_bidi_controls(ch):
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars(f"left{ch}right", "note")
    assert exc.value.status_code == 400


def test_allows_tab_newline_carriage_return():
    assert api._reject_control_chars("a\tb\nc\rd", "note") == "a\tb\nc\rd"


def test_bidi_controls_frozenset_locked():
    assert api._BIDI_CONTROLS == frozenset("\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069")
