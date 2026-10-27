from fastapi.testclient import TestClient

import api
import ingress_security as sec

CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"


def test_security_headers_include_csp():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["content-security-policy"] == CSP
    assert "default-src 'none'" in values["content-security-policy"]
    assert "frame-ancestors 'none'" in values["content-security-policy"]
    assert "*" not in values["content-security-policy"]


def test_health_response_carries_csp():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["content-security-policy"] == CSP
