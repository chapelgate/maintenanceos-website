from fastapi.testclient import TestClient

import api
import ingress_security as sec

COEP = "require-corp"


def test_security_headers_include_coep():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["cross-origin-embedder-policy"] == COEP
    assert values["cross-origin-embedder-policy"] != "unsafe-none"
    assert "*" not in values["cross-origin-embedder-policy"]


def test_health_response_carries_coep():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["cross-origin-embedder-policy"] == COEP
