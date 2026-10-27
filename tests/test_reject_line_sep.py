import pytest
from fastapi import HTTPException

import api


@pytest.mark.parametrize("ch", ["\u2028", "\u2029"])
def test_reject_line_para_separators(ch):
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars(f"line{ch}para", "note")
    assert exc.value.status_code == 400
    assert "control characters" in exc.value.detail


def test_line_para_sep_constant_locked():
    assert api._LINE_PARA_SEP == frozenset("\u2028\u2029")


def test_plain_text_still_allowed():
    assert api._reject_control_chars("plain note", "note") == "plain note"
