from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail


def test_sanitize_redacts_aws_access_key_and_jwt():
    jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturepart"
    raw = f"creds AKIA0123456789ABCDEF ASIA0123456789ABCDEF token {jwt}"
    redacted = sanitize_http_detail(raw)
    assert "AKIA0123456789ABCDEF" not in redacted
    assert "ASIA0123456789ABCDEF" not in redacted
    assert jwt not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_aws_and_jwt():
    jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturepart"

    @api.app.get("/__test_aws_jwt_error")
    def _boom():
        raise HTTPException(403, f"leak AKIA0123456789ABCDEF {jwt}")

    try:
        response = TestClient(api.app).get("/__test_aws_jwt_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "AKIA0123456789ABCDEF" not in detail
        assert jwt not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_aws_jwt_error"
        ]
