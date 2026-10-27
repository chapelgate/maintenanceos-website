import pytest
from fastapi import HTTPException
import api

def test_api_wires_reject_on_marker():
    assert '_reject_control_chars(_bounded_text(body.get("marker")' in open('api.py').read()

def test_reject_control_chars_on_marker():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('P0\x00', 'marker')
    assert exc.value.status_code == 400
