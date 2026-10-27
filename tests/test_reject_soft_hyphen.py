import pytest
from fastapi import HTTPException

import api


def test_reject_soft_hyphen():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("soft\u00adhyphen", "note")
    assert exc.value.status_code == 400
    assert "control characters" in exc.value.detail


def test_soft_hyphen_constant_locked():
    assert api._SOFT_HYPHEN == "\u00ad"


def test_plain_text_still_allowed():
    assert api._reject_control_chars("plain-note", "note") == "plain-note"
