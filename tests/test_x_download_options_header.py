from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_security_headers_include_x_download_options():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["x-download-options"] == "noopen"


def test_health_response_carries_x_download_options():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["x-download-options"] == "noopen"
