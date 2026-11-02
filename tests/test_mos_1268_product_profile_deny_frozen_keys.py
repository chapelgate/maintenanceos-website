import pytest

from product_profile import DENY_KEYS, ProductProfileError, validate_overlay


NEW_DENY = (
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
)


def test_deny_keys_include_new_frozen_surfaces():
    for key in NEW_DENY:
        assert key in DENY_KEYS


@pytest.mark.parametrize("key", NEW_DENY)
def test_validate_overlay_rejects_new_frozen_keys(key):
    with pytest.raises(ProductProfileError, match=key):
        validate_overlay({key: True})


def test_validate_overlay_still_allows_safe_branding():
    validate_overlay({"branding": "pilot"})
