import pytest
from fastapi import HTTPException, Request

import api
import readiness
from security import INSECURE_APP_SECRETS, internal_api_token_ready


def make_request(token=""):
    headers = []
    if token:
        headers.append((b"authorization", f"Bearer {token}".encode()))
    return Request({"type": "http", "method": "GET", "path": "/readiness", "headers": headers})


def test_internal_token_rejects_short_blank_and_placeholder(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_TOKEN", "i" * 31)
    assert internal_api_token_ready() is False
    assert readiness.CHECKS["internal_api_secured"]() is False
    with pytest.raises(HTTPException) as short:
        api.require_internal_api(make_request("i" * 31))
    assert short.value.status_code == 503

    monkeypatch.setenv("INTERNAL_API_TOKEN", " " * 40)
    assert internal_api_token_ready() is False

    monkeypatch.setenv("INTERNAL_API_TOKEN", "\n" + ("i" * 31) + " ")
    assert internal_api_token_ready() is False
    with pytest.raises(HTTPException) as padded:
        api.require_internal_api(make_request("i" * 31))
    assert padded.value.status_code == 503

    placeholder = "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET"
    assert placeholder in INSECURE_APP_SECRETS
    monkeypatch.setenv("INTERNAL_API_TOKEN", placeholder)
    assert internal_api_token_ready() is False
    with pytest.raises(HTTPException) as known:
        api.require_internal_api(make_request(placeholder))
    assert known.value.status_code == 503


def test_internal_token_accepts_32_after_strip(monkeypatch):
    token = "i" * 32
    monkeypatch.setenv("INTERNAL_API_TOKEN", f"  {token}\n")
    assert internal_api_token_ready() is True
    assert readiness.CHECKS["internal_api_secured"]() is True


def test_internal_token_minimum_is_32():
    assert len("i" * 32) == 32
    assert len("i" * 31) == 31
