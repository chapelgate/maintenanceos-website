from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail

FINE = "github_pat_11ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz0123456789ABCD"


def test_sanitize_redacts_github_fine_pat():
    redacted = sanitize_http_detail(f"token {FINE} leaked")
    assert FINE not in redacted
    assert "github_pat_" not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_github_fine_pat():
    @api.app.get("/__test_github_fine_pat_error")
    def _boom():
        raise HTTPException(403, f"leak {FINE}")

    try:
        response = TestClient(api.app).get("/__test_github_fine_pat_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert FINE not in detail
        assert "github_pat_" not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_github_fine_pat_error"
        ]
