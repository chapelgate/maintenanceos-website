from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail


def test_sanitize_redacts_google_api_key():
    raw = "provider key AIzaSyA-test-key-1234567890 leaked"
    redacted = sanitize_http_detail(raw)
    assert "AIzaSyA-test-key-1234567890" not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_google_api_key():
    @api.app.get("/__test_google_key_error")
    def _boom():
        raise HTTPException(403, "leak AIzaSyA-test-key-1234567890")

    try:
        response = TestClient(api.app).get("/__test_google_key_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "AIzaSyA-test-key-1234567890" not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_google_key_error"
        ]
