import pytest
from fastapi import HTTPException
import api

def test_api_wires_reject_on_idempotency_key():
    text = open('api.py').read()
    assert text.count('_reject_control_chars(_bounded_text') >= 1
    assert '"Idempotency-Key"' in text
    assert text.count('"Idempotency-Key")') >= 2 or text.count(',"Idempotency-Key")') >= 2

def test_reject_control_chars_on_idempotency_key():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars('key\x00', 'Idempotency-Key')
    assert exc.value.status_code == 400
