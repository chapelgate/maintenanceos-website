from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_permissions_policy_denies_unload():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert "unload=()" in values["permissions-policy"]


def test_health_response_permissions_policy_denies_unload():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert "unload=()" in response.headers["permissions-policy"]
