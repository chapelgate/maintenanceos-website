import inspect

import pytest
from fastapi import HTTPException

import api


def test_require_twilio_signature_source_wired():
    source = inspect.getsource(api)
    assert source.count("_require_twilio_signature") >= 4
    assert "TWILIO_SIGNATURE_MAX" in source


def test_require_twilio_signature_rejects_control_chars():
    with pytest.raises(HTTPException) as exc:
        api._require_twilio_signature("abc" + chr(0) + "def")
    assert exc.value.status_code == 400


def test_require_twilio_signature_rejects_overlong():
    with pytest.raises(HTTPException) as exc:
        api._require_twilio_signature("x" * (api.TWILIO_SIGNATURE_MAX + 1))
    assert exc.value.status_code == 400


def test_require_twilio_signature_accepts_plain():
    assert api._require_twilio_signature("plain-signature-value") == "plain-signature-value"
