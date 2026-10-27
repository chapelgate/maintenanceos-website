import pytest
from fastapi import HTTPException

import api


def test_api_wires_reject_on_messaging_body():
    text = open("api.py").read()
    assert '_reject_control_chars(_bounded_text(form.get("Body",""),"Body",maximum=MESSAGING_BODY_MAX),"body")' in text


def test_reject_control_chars_on_body():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("hello\x00", "body")
    assert exc.value.status_code == 400
