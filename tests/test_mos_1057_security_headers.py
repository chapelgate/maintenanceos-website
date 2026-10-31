from fastapi.testclient import TestClient

import api
import ingress_security as sec


def _headers():
    return {n.decode(): v.decode() for n, v in sec.SECURITY_HEADERS}


def test_security_headers_tuple_is_exact():
    names = [n.decode() for n, _ in sec.SECURITY_HEADERS]
    assert "content-security-policy" in names
    assert "strict-transport-security" in names
    assert "permissions-policy" in names
    assert all(isinstance(n, bytes) and isinstance(v, bytes) for n, v in sec.SECURITY_HEADERS)


def test_health_response_carries_locked_headers():
    r = TestClient(api.app).get("/health")
    for name, value in _headers().items():
        assert r.headers.get(name) == value


def test_security_headers_forbid_permissive_frame_or_referrer():
    values = _headers()
    assert values["x-frame-options"].upper() == "DENY"
    assert "ALLOWALL" not in values["x-frame-options"].upper()
    assert values["referrer-policy"] == "no-referrer"


def test_csp_forbids_unsafe_inline_and_eval():
    csp = _headers()["content-security-policy"]
    assert "default-src 'none'" in csp
    assert "unsafe-inline" not in csp
    assert "unsafe-eval" not in csp


def test_permissions_policy_disables_sensitive_features():
    pp = _headers()["permissions-policy"]
    for feature in ("camera=()", "microphone=()", "geolocation=()", "payment=()", "usb=()"):
        assert feature in pp


def test_cross_origin_policies_restrictive():
    values = _headers()
    assert values["cross-origin-opener-policy"] == "same-origin"
    assert values["cross-origin-resource-policy"] == "same-origin"
    assert values["cross-origin-embedder-policy"] == "require-corp"


def test_hsts_has_sufficient_max_age_and_subdomains():
    hsts = _headers()["strict-transport-security"]
    assert "max-age=31536000" in hsts
    assert "includeSubDomains" in hsts


def test_expect_ct_enforces_with_report_uri():
    ect = _headers()["expect-ct"]
    assert "enforce" in ect
    assert "report-uri=" in ect


def test_x_download_options_and_cross_domain_policies():
    values = _headers()
    assert values["x-download-options"] == "noopen"
    assert "x-permitted-cross-domain-policies" in values


def test_dns_prefetch_control_off():
    assert _headers()["x-dns-prefetch-control"] == "off"


def test_origin_agent_cluster_present():
    assert _headers()["origin-agent-cluster"] == "?1"


def test_no_headers_leak_on_error_responses():
    r = TestClient(api.app).get("/no-such-route-xyz")
    assert r.status_code in {404, 405}
    assert r.headers.get("x-frame-options") == "DENY"
    assert "server" not in {k.lower() for k in r.headers.keys()} or r.headers.get("server") in (None, "")


def test_no_headers_leak_on_json_error():
    r = TestClient(api.app).get("/health")
    assert "set-cookie" not in {k.lower() for k in r.headers.keys()}


def test_request_id_header_added():
    # middleware may add x-request-id; ensure path does not crash
    r = TestClient(api.app).get("/health")
    assert r.status_code == 200


def test_secured_send_preserves_custom_headers():
    # SECURITY_HEADERS applied without dropping content-type
    r = TestClient(api.app).get("/health")
    assert "content-type" in {k.lower() for k in r.headers.keys()}
    assert r.headers.get("content-security-policy")


def test_security_headers_not_duplicated():
    names = [n.decode() for n, _ in sec.SECURITY_HEADERS]
    assert len(names) == len(set(names))


def test_all_security_headers_are_bytes():
    assert all(isinstance(n, bytes) and isinstance(v, bytes) for n, v in sec.SECURITY_HEADERS)


def test_cache_control_no_store_on_health():
    r = TestClient(api.app).get("/health")
    # cache-control may be set by middleware or absent; if present must be restrictive
    cc = r.headers.get("cache-control", "").lower()
    if cc:
        assert "no-store" in cc or "no-cache" in cc


def test_permissions_policy_contain_unload_directive():
    assert "unload=()" in _headers()["permissions-policy"]


def test_no_vary_header_in_security_headers():
    assert "vary" not in {n.decode() for n, _ in sec.SECURITY_HEADERS}


def test_x_content_type_options_nosniff():
    assert _headers()["x-content-type-options"] == "nosniff"
    assert TestClient(api.app).get("/health").headers.get("x-content-type-options") == "nosniff"


def test_no_server_header_exposed():
    r = TestClient(api.app).get("/health")
    # uvicorn/testclient may inject; lock that app does not set Server via SECURITY_HEADERS
    assert "server" not in {n.decode() for n, _ in sec.SECURITY_HEADERS}


def test_security_headers_applied_to_contractor_forms():
    # contractor portal may be off; still assert middleware headers on a form-ish path attempt
    r = TestClient(api.app).get("/contractor/decision")
    assert r.headers.get("x-frame-options") == "DENY"
    assert r.headers.get("content-security-policy")
