from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
from http_error_text import sanitize_http_detail

SK = "sk_live_51ABCDEFghijklmnopqrstuvwxyz012345"
RK = "rk_test_51ABCDEFghijklmnopqrstuvwxyz012345"
PK = "pk_live_51ABCDEFghijklmnopqrstuvwxyz012345"


def test_sanitize_redacts_stripe_secret_and_restricted_keys():
    redacted = sanitize_http_detail(f"keys {SK} {RK} leaked")
    assert SK not in redacted
    assert RK not in redacted
    assert "[REDACTED]" in redacted


def test_sanitize_leaves_publishable_key():
    assert PK in sanitize_http_detail(f"pub {PK}")


def test_http_exception_handler_redacts_stripe_secret_key():
    @api.app.get("/__test_stripe_key_error")
    def _boom():
        raise HTTPException(403, f"leak {SK}")

    try:
        response = TestClient(api.app).get("/__test_stripe_key_error")
        assert response.status_code == 403
        detail = response.json()["detail"]
        assert SK not in detail
        assert "[REDACTED]" in detail
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_stripe_key_error"
        ]
