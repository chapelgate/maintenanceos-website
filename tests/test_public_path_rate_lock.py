from fastapi.testclient import TestClient

import api
import ingress_security as sec


EXPECTED_PUBLIC_PATHS = {
    "/contractor/availability",
    "/contractor/complete",
    "/contractor/decision",
    "/messaging/inbound",
    "/voice/inbound",
    "/voice/stream-status",
}


def test_public_http_paths_are_exact():
    assert sec.PUBLIC_HTTP_PATHS == EXPECTED_PUBLIC_PATHS


def test_default_public_http_rate_is_120(monkeypatch):
    monkeypatch.delenv("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", raising=False)
    assert sec.bounded_rate("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", 120) == 120
    assert sec.rate_setting_valid("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE") is False


def test_public_path_returns_429_with_retry_after(monkeypatch):
    monkeypatch.setenv("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", "2")
    sec.PUBLIC_INGRESS_LIMITER.clear()
    client = TestClient(api.app)
    first = client.get("/contractor/decision")
    second = client.get("/contractor/decision")
    third = client.get("/contractor/decision")
    assert first.status_code != 429
    assert second.status_code != 429
    assert third.status_code == 429
    assert third.headers.get("retry-after") == "60"
    assert third.text == "Too many requests"
    sec.PUBLIC_INGRESS_LIMITER.clear()
