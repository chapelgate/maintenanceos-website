import pytest
from fastapi import HTTPException
import api

def test_api_wires_reject_on_from():
    assert '_reject_control_chars(_bounded_text(str(form.get("From","") or ""),"From",required=True,maximum=MESSAGING_FROM_MAX),"From")' in open('api.py').read()

def test_reject_control_chars_on_from():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('+44\x001', 'From')
    assert exc.value.status_code == 400
