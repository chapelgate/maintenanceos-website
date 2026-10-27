from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_permissions_policy_denies_clipboard():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    policy = values["permissions-policy"]
    assert "clipboard-read=()" in policy
    assert "clipboard-write=()" in policy


def test_health_response_carries_clipboard_denies():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    policy = response.headers["permissions-policy"]
    assert "clipboard-read=()" in policy
    assert "clipboard-write=()" in policy
