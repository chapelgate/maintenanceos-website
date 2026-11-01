import pytest

from product_profile import DENY_KEYS, ProductProfileError, validate_overlay


def test_deny_keys_include_frozen_surfaces():
    for key in ("deploy", "nginx", "golden_line", "secret", "production"):
        assert key in DENY_KEYS


def test_validate_overlay_rejects_deploy():
    with pytest.raises(ProductProfileError, match="deploy"):
        validate_overlay({"deploy": True})


def test_validate_overlay_allows_safe_key():
    validate_overlay({"branding": "pilot"})
