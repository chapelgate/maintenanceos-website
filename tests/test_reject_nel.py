import pytest
from fastapi import HTTPException

import api


@pytest.mark.parametrize("ch", ["\x85", "\x80", "\x9f"])
def test_reject_c1_controls_including_nel(ch):
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars(f"left{ch}right", "note")
    assert exc.value.status_code == 400
    assert "control characters" in exc.value.detail


def test_c1_controls_constant_locked():
    assert api._C1_CONTROLS == frozenset(chr(i) for i in range(0x80, 0xA0))


def test_plain_text_still_allowed():
    assert api._reject_control_chars("plain note", "note") == "plain note"
