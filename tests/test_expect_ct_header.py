from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_security_headers_include_expect_ct():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["expect-ct"] == "enforce, max-age=31536000, report-uri=/ct-err"


def test_health_response_carries_expect_ct():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["expect-ct"] == "enforce, max-age=31536000, report-uri=/ct-err"
