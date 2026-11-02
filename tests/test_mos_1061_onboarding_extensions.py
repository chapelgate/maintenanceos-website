import os

import product_profile
from fastapi.testclient import TestClient

import api
from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol
from secret_patterns import SENSITIVE_KEY, redact_secrets


def test_onboarding_no_openapi_docs_exposed():
    assert api.app.docs_url is None
    assert api.app.redoc_url is None
    assert api.app.openapi_url is None
    client = TestClient(api.app)
    assert client.get("/docs").status_code in {404, 405}
    assert client.get("/openapi.json").status_code in {404, 405}


def test_health_endpoint_no_secrets_in_body(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    body = TestClient(api.app).get("/health").json()
    blob = str(body).lower()
    assert "password" not in blob
    assert "bearer " not in blob
    assert "sk-" not in blob


def test_no_duplicate_regex_constants_across_modules():
    for path in ("audit_text.py", "http_error_text.py", "operational_logging.py"):
        text = open(path).read()
        assert "from secret_patterns import" in text
        assert "BEARER_VALUE = re.compile" not in text


def test_product_profile_deny_keys_comprehensive():
    assert product_profile.DENY_KEYS == {
        "retention",
        "voice",
        "telephony",
        "market",
        "dispatch",
        "credential",
        "deploy",
        "nginx",
        "golden_line",
        "secret",
        "production",
        "disclosure",
        "redaction",
        "pii",
        "customer_pii",
        "live_customer",
        "approved_release",
        "ir_deadline",
        "voice_line",
        "production_db",
        "nginx_config",
    }


def test_api_title_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert isinstance(product_profile.api_title(), str)


def test_page_title_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert isinstance(product_profile.page_title(), str)


def test_worker_banner_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert isinstance(product_profile.worker_banner(), str)


def test_allowed_profiles_has_expected_values():
    assert product_profile.ALLOWED_PROFILES == {"maintenanceos", "worksmartos"}


def test_validate_overlay_rejects_all_deny_keys():
    import pytest

    for key in product_profile.DENY_KEYS:
        with pytest.raises(product_profile.ProductProfileError):
            product_profile.validate_overlay({key: "x"})


def test_validate_overlay_passes_safe_keys():
    product_profile.validate_overlay({"label": "ok"})


def test_sanitize_functions_exist():
    sample = "Bearer abc123 sk-abcdefghij user@example.com +441234567890"
    assert "[REDACTED]" in redact_detail(sample)
    assert "[REDACTED]" in sanitize_http_detail(sample)
    assert "[REDACTED]" in ol._redact(sample, "note")
    assert SENSITIVE_KEY.search("authorization")


def test_health_endpoint_returns_200_and_headers():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert response.headers.get("x-content-type-options") == "nosniff"


def test_shared_redaction_helper_covers_github_pat():
    assert "[REDACTED]" in redact_secrets("ghp_" + ("A" * 36))
