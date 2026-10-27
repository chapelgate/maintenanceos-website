import inspect

import pytest
from fastapi import HTTPException

import api


def test_require_pilot_proof_token_source_wired():
    source = inspect.getsource(api.pilot_synthetic_email_proof)
    assert "_require_pilot_proof_token" in source
    assert "PILOT_PROOF_TOKEN_MAX" in inspect.getsource(api)


def test_require_pilot_proof_token_rejects_control_chars():
    with pytest.raises(HTTPException) as exc:
        api._require_pilot_proof_token("tok" + chr(0) + "en")
    assert exc.value.status_code == 400


def test_require_pilot_proof_token_rejects_overlong():
    with pytest.raises(HTTPException) as exc:
        api._require_pilot_proof_token("x" * (api.PILOT_PROOF_TOKEN_MAX + 1))
    assert exc.value.status_code == 400


def test_require_pilot_proof_token_accepts_plain():
    assert api._require_pilot_proof_token("plain-token") == "plain-token"
