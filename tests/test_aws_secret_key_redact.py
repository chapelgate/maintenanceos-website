from fastapi.testclient import TestClient
import api
from http_error_text import sanitize_http_detail
from audit_text import redact_detail
import operational_logging as ol

AWS_SECRET = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"


def test_http_redacts_aws_secret_key():
    redacted = sanitize_http_detail(f"key {AWS_SECRET} leaked")
    assert AWS_SECRET not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_aws_secret_key():
    redacted = redact_detail(f"key {AWS_SECRET} leaked")
    assert AWS_SECRET not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_aws_secret_key():
    redacted = ol._redact(f"key {AWS_SECRET} leaked", "note")
    assert AWS_SECRET not in redacted
    assert "[REDACTED]" in redacted


def test_http_exception_handler_redacts_aws_secret_key():
    @api.app.get("/__test_aws_secret_error")
    def _boom():
        from fastapi import HTTPException
        raise HTTPException(403, f"leak {AWS_SECRET}")
    try:
        response = TestClient(api.app).get("/__test_aws_secret_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert AWS_SECRET not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_aws_secret_error"
        ]
