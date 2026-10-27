import pytest
from fastapi import HTTPException

import api


@pytest.mark.parametrize(
    "ch",
    ["\u200b", "\u200c", "\u200d", "\u200e", "\u200f", "\ufeff", "\u2060"],
)
def test_reject_zero_width_and_format(ch):
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars(f"left{ch}right", "note")
    assert exc.value.status_code == 400
    assert "control characters" in exc.value.detail


def test_zw_format_frozenset_locked():
    assert api._ZW_FORMAT == frozenset("\u200b\u200c\u200d\u200e\u200f\ufeff\u2060")


def test_plain_text_still_allowed():
    assert api._reject_control_chars("plain note", "note") == "plain note"
