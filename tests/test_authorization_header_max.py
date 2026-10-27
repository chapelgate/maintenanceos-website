import inspect

import pytest
from fastapi import HTTPException
from starlette.requests import Request

import api


def test_authorization_header_max_constant():
    assert api.AUTHORIZATION_HEADER_MAX == 512
    source = inspect.getsource(api.require_internal_api)
    assert "AUTHORIZATION_HEADER_MAX" in source


def test_overlong_authorization_rejected(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_TOKEN", "t" * 32)

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [(b"authorization", ("Bearer " + "x" * api.AUTHORIZATION_HEADER_MAX).encode())],
    }
    request = Request(scope, receive)
    with pytest.raises(HTTPException) as exc:
        api.require_internal_api(request)
    assert exc.value.status_code == 401
