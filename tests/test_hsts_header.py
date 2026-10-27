from fastapi.testclient import TestClient

import api
import ingress_security as sec

HSTS = "max-age=31536000; includeSubDomains"


def test_security_headers_include_hsts():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["strict-transport-security"] == HSTS
    assert "max-age=0" not in values["strict-transport-security"]


def test_health_response_carries_hsts():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["strict-transport-security"] == HSTS
