from fastapi.testclient import TestClient

import api
import ingress_security as sec

EXPANDED = (
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), "
    "accelerometer=(), gyroscope=(), magnetometer=(), midi=(), display-capture=(), browsing-topics=(), "
    "clipboard-read=(), clipboard-write=(), serial=(), hid=(), xr-spatial-tracking=(), screen-wake-lock=(), "
    "fullscreen=(), autoplay=(), encrypted-media=(), picture-in-picture=(), interest-cohort=(), idle-detection=(), "
    "window-management=(), document-domain=(), web-share=(), otp-credentials=(), unload=()"
)


def test_security_headers_permissions_policy_is_expanded():
    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert values["permissions-policy"] == EXPANDED
    for feature in ("payment", "usb", "bluetooth", "display-capture", "browsing-topics"):
        assert f"{feature}=()" in values["permissions-policy"]
    assert "*" not in values["permissions-policy"]


def test_health_response_carries_expanded_permissions_policy():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers["permissions-policy"] == EXPANDED
