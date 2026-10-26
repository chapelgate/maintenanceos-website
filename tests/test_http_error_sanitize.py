from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail


def test_sanitize_http_detail_redacts_secrets():
    raw = (
        "Denied for resident@example.test "
        "+447700900123 "
        "Bearer top-secret-token "
        "sk-abcdefghijklmnop "
        "CA0123456789abcdef0123456789abcdef"
    )
    redacted = sanitize_http_detail(raw)
    assert "resident@example.test" not in redacted
    assert "+447700900123" not in redacted
    assert "top-secret-token" not in redacted
    assert "sk-abcdefghijklmnop" not in redacted
    assert "CA0123456789abcdef0123456789abcdef" not in redacted
    assert "[REDACTED]" in redacted


def test_sanitize_leaves_non_string_detail():
    assert sanitize_http_detail({"code": "x"}) == {"code": "x"}
    assert sanitize_http_detail(None) is None
    assert sanitize_http_detail(409) == 409


def test_http_exception_handler_returns_redacted_detail():
    @api.app.get("/__test_sanitize_error")
    def _boom():
        raise HTTPException(
            403,
            "Contact resident@example.test with Bearer leak-token-value",
        )

    try:
        response = TestClient(api.app).get("/__test_sanitize_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert "resident@example.test" not in detail
        assert "leak-token-value" not in detail
        assert "Bearer [REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_sanitize_error"
        ]
