import pytest
import product_profile


def test_profile_rejects_unknown(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "unknown")
    with pytest.raises(product_profile.ProductProfileError):
        product_profile.profile()


def test_overlay_validation_rejects_deny_keys():
    for key in product_profile.DENY_KEYS:
        with pytest.raises(product_profile.ProductProfileError):
            product_profile.validate_overlay({key: "x"})


def test_valid_overlay_passes():
    product_profile.validate_overlay({"label": "ok", "theme": "light"})
