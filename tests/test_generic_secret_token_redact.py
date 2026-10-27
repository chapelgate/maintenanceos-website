from fastapi.testclient import TestClient
import api
from http_error_text import sanitize_http_detail
from audit_text import redact_detail
import operational_logging as ol

GH_OAUTH = "gho_" + "A" * 36
GH_USER = "ghu_" + "A" * 36
GH_SESSION = "ghs_" + "A" * 36
NPM = "npm_" + "A" * 36
XOXE = "xoxe-1-abcdef1234567890"


def test_http_redacts_generic_tokens():
    redacted = sanitize_http_detail(f"tok {GH_OAUTH} {GH_USER} {GH_SESSION} {NPM} {XOXE}")
    for tok in (GH_OAUTH, GH_USER, GH_SESSION, NPM, XOXE):
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_generic_tokens():
    redacted = redact_detail(f"tok {GH_OAUTH} {GH_USER} {GH_SESSION} {NPM} {XOXE}")
    for tok in (GH_OAUTH, GH_USER, GH_SESSION, NPM, XOXE):
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_generic_tokens():
    redacted = ol._redact(f"tok {GH_OAUTH} {GH_USER} {GH_SESSION} {NPM} {XOXE}", "note")
    for tok in (GH_OAUTH, GH_USER, GH_SESSION, NPM, XOXE):
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_generic_tokens():
    @api.app.get("/__test_generic_token_error")
    def _boom():
        from fastapi import HTTPException
        raise HTTPException(403, f"leak {GH_OAUTH}")
    try:
        response = TestClient(api.app).get("/__test_generic_token_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert GH_OAUTH not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_generic_token_error"
        ]
