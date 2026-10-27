import pytest
from fastapi import HTTPException
import api

def test_api_wires_reject_on_incident_key():
    assert '_reject_control_chars(_bounded_text(raw_incident,"incident_key",maximum=INCIDENT_LINK_KEY_MAX),"incident_key") or None' in open('api.py').read()

def test_reject_control_chars_on_incident_key():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('inc\x00', 'incident_key')
    assert exc.value.status_code == 400
