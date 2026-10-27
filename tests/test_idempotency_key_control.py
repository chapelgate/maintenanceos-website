import pytest
from fastapi import HTTPException
import api

def test_api_wires_reject_on_idempotency_key():
    assert '_reject_control_chars(_bounded_text(\n        request.headers.get("Idempotency-Key", ""),"Idempotency-Key",required=True,maximum=IDEMPOTENCY_KEY_MAX\n    ),"Idempotency-Key")' in open('api.py').read()

def test_reject_control_chars_on_idempotency_key():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('ide\x00mpotency', 'Idempotency-Key')
    assert exc.value.status_code == 400
