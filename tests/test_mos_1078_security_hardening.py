from fastapi.testclient import TestClient
import api
import ingress_security as sec


def test_health_csp_present():
    csp = TestClient(api.app).get("/health").headers.get("content-security-policy")
    assert csp and "default-src 'none'" in csp
    assert "unsafe-inline" not in csp


def test_security_headers_tuple_is_exact():
    assert any(n == b"content-security-policy" for n, _ in sec.SECURITY_HEADERS)
    assert any(n == b"strict-transport-security" for n, _ in sec.SECURITY_HEADERS)


def test_x_frame_options_deny_on_health():
    assert TestClient(api.app).get("/health").headers.get("x-frame-options") == "DENY"
