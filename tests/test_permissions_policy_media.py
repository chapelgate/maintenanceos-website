from fastapi.testclient import TestClient

import api
import ingress_security as sec


def test_permissions_policy_denies_media_and_window_features():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    policy = values["permissions-policy"]
    for feature in (
        "autoplay=()",
        "encrypted-media=()",
        "picture-in-picture=()",
        "interest-cohort=()",
        "idle-detection=()",
        "window-management=()",
        "document-domain=()",
        "web-share=()",
        "otp-credentials=()",
    ):
        assert feature in policy
    # no duplicate feature tokens
    for feature in (
        "autoplay=()",
        "encrypted-media=()",
        "picture-in-picture=()",
        "idle-detection=()",
        "window-management=()",
        "web-share=()",
    ):
        assert policy.count(feature) == 1


def test_health_response_carries_media_denies():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    policy = response.headers["permissions-policy"]
    assert "autoplay=()" in policy
    assert "web-share=()" in policy
    assert "otp-credentials=()" in policy
