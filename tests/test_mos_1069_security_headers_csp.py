from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_health_csp_present():
    response = TestClient(api.app).get("/health")
    csp = response.headers.get("content-security-policy")
    assert csp is not None
    assert "default-src 'none'" in csp
    assert "frame-ancestors 'none'" in csp
    assert "unsafe-inline" not in csp
    assert "unsafe-eval" not in csp


def test_health_security_headers_match_lock():
    response = TestClient(api.app).get("/health")
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    for name, value in values.items():
        assert response.headers.get(name) == value


def test_content_length_accurate():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    declared = response.headers.get("content-length")
    assert declared is not None
    assert int(declared) == len(response.content)
