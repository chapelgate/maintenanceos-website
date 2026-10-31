import pytest
import product_profile


def test_profile_unknown_fails_closed(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "not-real")
    with pytest.raises(product_profile.ProductProfileError):
        product_profile.profile()


def test_api_title_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.api_title()
    assert isinstance(product_profile.api_title(), str)


def test_page_title_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.page_title()
    assert isinstance(product_profile.page_title(), str)


def test_validate_overlay_rejects_deny_keys(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    for key in product_profile.DENY_KEYS:
        with pytest.raises(product_profile.ProductProfileError):
            product_profile.validate_overlay({key: "x"})


def test_validate_overlay_accepts_allowed(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    product_profile.validate_overlay({"allowed": "yes"})


def test_profile_env_overrides_default(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "maintenanceos")
    assert product_profile.profile() == "maintenanceos"
