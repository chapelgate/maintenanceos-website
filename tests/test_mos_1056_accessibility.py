from pathlib import Path

from fastapi.testclient import TestClient

import api
import product_profile
from http_error_text import sanitize_http_detail, sanitize_json_payload
from audit_text import redact_detail


def test_sanitize_http_detail_pem_private_key():
    pem = "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----"
    out = sanitize_http_detail(f"key {pem} leaked")
    assert "BEGIN PRIVATE KEY" not in out
    assert "[REDACTED]" in out


def test_no_duplicate_regex_constants_http_error_text():
    text = Path("http_error_text.py").read_text()
    assert "BEARER_VALUE = re.compile" not in text
    assert "from secret_patterns import" in text


def test_no_duplicate_regex_constants_audit_text():
    text = Path("audit_text.py").read_text()
    assert "BEARER_VALUE = re.compile" not in text
    assert "from secret_patterns import" in text


def test_api_health_endpoint_no_secrets():
    body = str(TestClient(api.app).get("/health").json()).lower()
    assert "password" not in body
    assert "bearer" not in body
    assert "sk-" not in body


def test_api_error_response_is_sanitized():
    raw = "Bearer abc sk-abcdefghij user@example.com"
    assert "Bearer abc" not in str(sanitize_http_detail(raw))
    assert "user@example.com" not in str(sanitize_http_detail(raw))


def test_html_forms_have_aria_labels():
    # Source locks: contractor portal templates include labels/aria
    sources = []
    for path in ("portal_pages.py", "contractor_portal.py", "api.py"):
        p = Path(path)
        if p.is_file():
            sources.append(p.read_text())
    blob = "\n".join(sources).lower()
    assert "aria-labelledby" in blob or "aria-label" in blob or "<label" in blob


def test_product_profile_title_used_for_api(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    title = product_profile.api_title()
    assert isinstance(title, str) and title
    # health exposes product_title when available
    data = TestClient(api.app).get("/health").json()
    assert "product_title" in data
    assert data["product_title"] == title


def test_api_has_no_openapi_or_docs_exposed():
    assert api.app.docs_url is None
    assert api.app.redoc_url is None
    assert api.app.openapi_url is None
    client = TestClient(api.app)
    assert client.get("/docs").status_code in {404, 405}
    assert client.get("/openapi.json").status_code in {404, 405}


def test_health_response_has_no_raw_emails():
    blob = str(TestClient(api.app).get("/health").json())
    assert "@" not in blob or "example.invalid" in blob.lower()


def test_redact_detail_no_secrets_leak():
    out = redact_detail("Bearer tokensecret sk-abcdefghij")
    assert "tokensecret" not in out
    assert "sk-abcdefghij" not in out
