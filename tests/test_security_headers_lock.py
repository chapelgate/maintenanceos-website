from fastapi.testclient import TestClient

import api
import ingress_security as sec


EXPECTED = (
    (b"x-content-type-options", b"nosniff"),
    (b"x-frame-options", b"DENY"),
    (b"referrer-policy", b"no-referrer"),
    (b"cache-control", b"no-store"),
    (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
    (b"cross-origin-opener-policy", b"same-origin"),
    (b"content-security-policy", b"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"),
    (b"cross-origin-resource-policy", b"same-origin"),
    (b"cross-origin-embedder-policy", b"require-corp"),
)


def test_security_headers_tuple_is_exact():
    assert sec.SECURITY_HEADERS == EXPECTED


def test_health_response_carries_locked_headers():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "no-referrer"
    assert response.headers["cache-control"] == "no-store"
    assert response.headers["permissions-policy"] == "camera=(), microphone=(), geolocation=()"
    assert response.headers["cross-origin-opener-policy"] == "same-origin"
    assert response.headers["content-security-policy"] == "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    assert response.headers["cross-origin-resource-policy"] == "same-origin"
    assert response.headers["cross-origin-embedder-policy"] == "require-corp"
    assert "x-request-id" in response.headers


def test_security_headers_forbid_permissive_frame_or_referrer():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["x-frame-options"] == "DENY"
    assert values["referrer-policy"] == "no-referrer"
    assert "ALLOWALL" not in values["x-frame-options"].upper()
    assert "*" not in values["referrer-policy"]
