import pytest
import product_profile
from http_error_text import sanitize_http_detail, sanitize_json_payload


def test_profile_rejects_unknown(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "unknown")
    with pytest.raises(product_profile.ProductProfileError):
        product_profile.profile()


def test_overlay_validation_rejects_deny_keys():
    for key in product_profile.DENY_KEYS:
        with pytest.raises(product_profile.ProductProfileError):
            product_profile.validate_overlay({key: "x"})


def test_sanitize_http_detail_basic_redaction():
    out = sanitize_http_detail("Bearer abc sk-abcdefghij")
    assert "sk-abcdefghij" not in out


def test_sanitize_json_payload_redacts_secrets_in_json():
    out = sanitize_json_payload({"note": "Bearer tokensecret"})
    assert "tokensecret" not in out
