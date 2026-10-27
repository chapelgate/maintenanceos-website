import pytest
from fastapi import HTTPException
import api

def test_api_wires_reject_on_media_url():
    assert '_reject_control_chars(_bounded_text(str(form.get("MediaUrl0","") or ""),"MediaUrl0",maximum=MESSAGING_MEDIA_URL_MAX),"MediaUrl0")' in open('api.py').read()

def test_reject_control_chars_on_media_url():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('https://x\x00', 'MediaUrl0')
    assert exc.value.status_code == 400
