import concurrent.futures

from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_max_request_bytes_enforced():
    assert sec.MAX_REQUEST_BYTES == 64 * 1024
    assert api.MAX_REQUEST_BYTES == sec.MAX_REQUEST_BYTES


def test_security_boundary_middleware_present():
    assert any(getattr(m, "cls", None) is sec.HttpSecurityBoundary for m in api.app.user_middleware)
    source = open("api.py").read()
    assert "HttpSecurityBoundary" in source
    assert "add_middleware" in source


def test_content_length_header_present_on_responses():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers.get("content-length") is not None


def test_health_with_large_accept_header():
    response = TestClient(api.app).get("/health", headers={"Accept": "a" * 8000})
    assert response.status_code == 200
    assert response.json().get("ok") is True


def test_work_order_with_oversized_description_rejected(monkeypatch):
    monkeypatch.setenv("INTERNAL_API_TOKEN", "t" * 32)
    client = TestClient(api.app)
    # Oversized raw body should hit security boundary 413
    oversized = client.post(
        "/work-orders",
        content="x" * (sec.MAX_REQUEST_BYTES + 1),
        headers={"Authorization": "Bearer " + ("t" * 32), "Content-Type": "application/json"},
    )
    assert oversized.status_code == 413


def test_csrf_token_present_with_large_payload(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    response = TestClient(api.app).get("/health", headers={"Accept": "text/html," + ("x" * 4000)})
    assert response.status_code == 200
    assert response.headers.get("x-csrf-token")


def test_multiple_concurrent_requests_respect_limits(monkeypatch):
    monkeypatch.setenv("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", "3")
    sec.PUBLIC_INGRESS_LIMITER.clear()
    client = TestClient(api.app)

    def hit():
        return client.get("/contractor/decision").status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        codes = list(pool.map(lambda _: hit(), range(6)))
    assert 429 in codes
    sec.PUBLIC_INGRESS_LIMITER.clear()


def test_no_body_on_get_no_content_length_issue():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200


def test_json_payload_size_reasonable():
    assert sec.MAX_REQUEST_BYTES >= 1024
    assert sec.MAX_REQUEST_BYTES <= 1024 * 1024


def test_security_boundary_imports_clean():
    source = open("ingress_security.py").read()
    assert "class HttpSecurityBoundary" in source
    assert "MAX_REQUEST_BYTES" in source
