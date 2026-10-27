from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_permissions_policy_denies_serial_hid_and_related():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    policy = values["permissions-policy"]
    for feature in (
        "serial=()",
        "hid=()",
        "xr-spatial-tracking=()",
        "screen-wake-lock=()",
        "fullscreen=()",
    ):
        assert feature in policy


def test_health_response_carries_serial_denies():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    policy = response.headers["permissions-policy"]
    assert "serial=()" in policy
    assert "hid=()" in policy
    assert "fullscreen=()" in policy
