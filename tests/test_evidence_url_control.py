import inspect
import pytest
from fastapi import HTTPException
import api

def test_normalize_evidence_url_rejects_control_chars():
    assert '_reject_control_chars' in inspect.getsource(api.normalize_evidence_url)
    with pytest.raises(HTTPException) as exc:
        api.normalize_evidence_url('https://example.com/x\x00')
    assert exc.value.status_code == 400
