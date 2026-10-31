from fastapi import HTTPException
from fastapi.testclient import TestClient

import api


def test_contractor_http_exception_returns_html_alert(monkeypatch):
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "false")
    response = TestClient(api.app).get(
        "/contractor/decision",
        params={
            "work_order_id": 1,
            "contractor_id": 1,
            "decision": "accept",
            "token": "x",
        },
    )
    assert response.status_code == 503
    assert "text/html" in response.headers.get("content-type", "")
    assert 'role="alert"' in response.text
    assert 'aria-live="assertive"' in response.text
    assert "Contractor portal is disabled" in response.text
    assert "Skip to content" in response.text


def test_contractor_html_error_sanitizes_detail(monkeypatch):
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")

    @api.app.get("/contractor/__test_html_error")
    def _boom():
        raise HTTPException(
            403,
            "Contact resident@example.test with Bearer leak-token-value",
        )

    try:
        response = TestClient(api.app).get("/contractor/__test_html_error")
        assert response.status_code == 403
        assert "text/html" in response.headers.get("content-type", "")
        assert "resident@example.test" not in response.text
        assert "leak-token-value" not in response.text
        assert "[REDACTED]" in response.text
        assert 'role="alert"' in response.text
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/contractor/__test_html_error"
        ]


def test_non_portal_http_exception_stays_json():
    @api.app.get("/__test_json_error")
    def _boom():
        raise HTTPException(400, "plain api failure")

    try:
        response = TestClient(api.app).get("/__test_json_error")
        assert response.status_code == 400
        assert response.headers.get("content-type", "").startswith("application/json")
        assert response.json()["detail"] == "plain api failure"
    finally:
        api.app.router.routes = [
            route
            for route in api.app.router.routes
            if getattr(route, "path", None) != "/__test_json_error"
        ]
