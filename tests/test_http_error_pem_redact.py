from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail

PEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC\n-----END PRIVATE KEY-----"


def test_sanitize_redacts_pem_private_key():
    redacted = sanitize_http_detail(f"key material {PEM} leaked")
    assert "BEGIN PRIVATE KEY" not in redacted
    assert "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC" not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_pem_private_key():
    @api.app.get("/__test_pem_error")
    def _boom():
        raise HTTPException(403, f"leak {PEM}")

    try:
        response = TestClient(api.app).get("/__test_pem_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "BEGIN PRIVATE KEY" not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_pem_error"
        ]
