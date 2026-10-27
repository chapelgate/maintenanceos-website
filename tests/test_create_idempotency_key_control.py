import pytest
from fastapi import HTTPException
import api

def test_create_work_order_wires_reject_on_idempotency_key():
    text = open('api.py').read()
    assert '_reject_control_chars(_bounded_text(request.headers.get("Idempotency-Key") or "","Idempotency-Key",maximum=IDEMPOTENCY_KEY_MAX),"Idempotency-Key") or None' in text

def test_reject_control_chars_on_idempotency_key():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('k\x00', 'Idempotency-Key')
    assert exc.value.status_code == 400
