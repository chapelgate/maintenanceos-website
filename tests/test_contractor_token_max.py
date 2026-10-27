import os
from pathlib import Path

import pytest
from fastapi import HTTPException

import api
import security


def test_token_max_constant():
    assert security.CONTRACTOR_LINK_TOKEN_MAX == 200
    assert api.CONTRACTOR_LINK_TOKEN_MAX == 200


def test_verify_link_rejects_overlong_without_hmac(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    called = {"sign": False}
    real_sign = security.sign_link

    def wrapped(*args, **kwargs):
        called["sign"] = True
        return real_sign(*args, **kwargs)

    monkeypatch.setattr(security, "sign_link", wrapped)
    overlong = "1." + ("a" * security.CONTRACTOR_LINK_TOKEN_MAX)
    assert len(overlong) > security.CONTRACTOR_LINK_TOKEN_MAX
    assert security.verify_link("accept", 1, 2, overlong) is False
    assert called["sign"] is False


def test_verify_link_accepts_valid_token(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    token = security.sign_link("accept", 1, 2)
    assert len(token) <= security.CONTRACTOR_LINK_TOKEN_MAX
    assert security.verify_link("accept", 1, 2, token) is True


def test_require_contractor_token_raises_400():
    overlong = "x" * (security.CONTRACTOR_LINK_TOKEN_MAX + 1)
    with pytest.raises(HTTPException) as exc:
        api._require_contractor_token(overlong)
    assert exc.value.status_code == 400
    assert "too long" in exc.value.detail


def test_api_wires_token_bound():
    source = (Path(__file__).resolve().parents[1] / "api.py").read_text(encoding="utf-8")
    assert source.count("_require_contractor_token(token)") >= 6
    assert "token is too long" in source
