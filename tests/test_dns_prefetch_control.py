from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_security_headers_include_dns_prefetch_control():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["x-dns-prefetch-control"] == "off"


def test_health_response_carries_dns_prefetch_control():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["x-dns-prefetch-control"] == "off"
