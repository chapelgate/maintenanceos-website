from fastapi.testclient import TestClient

import api
import ingress_security as sec

CORP = "same-origin"


def test_security_headers_include_corp():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["cross-origin-resource-policy"] == CORP
    assert values["cross-origin-resource-policy"] != "cross-origin"
    assert "*" not in values["cross-origin-resource-policy"]


def test_health_response_carries_corp():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["cross-origin-resource-policy"] == CORP
