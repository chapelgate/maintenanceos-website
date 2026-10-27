from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail

TOKEN = "xoxb-1234567890-abcdefghij"


def test_sanitize_redacts_slack_token():
    redacted = sanitize_http_detail(f"bot {TOKEN} leaked")
    assert TOKEN not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_slack_token():
    @api.app.get("/__test_slack_token_error")
    def _boom():
        raise HTTPException(403, f"leak {TOKEN}")

    try:
        response = TestClient(api.app).get("/__test_slack_token_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert TOKEN not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_slack_token_error"
        ]
