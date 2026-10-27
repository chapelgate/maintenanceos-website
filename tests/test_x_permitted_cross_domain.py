from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_security_headers_include_x_permitted_cross_domain():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["x-permitted-cross-domain-policies"] == "none"


def test_health_response_carries_x_permitted_cross_domain():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["x-permitted-cross-domain-policies"] == "none"
