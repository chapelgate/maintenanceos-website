import importlib
import sys

import pytest
from fastapi.testclient import TestClient

import api
import product_profile


def test_product_profile_title_consistency_across_endpoints(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.api_title() == "MaintenanceOS V1 Pilot"
    assert product_profile.page_title() == "MaintenanceOS V1"
    assert product_profile.worker_banner() == "MaintenanceOS V1 worker running"
    assert "from product_profile import" in open("api.py").read()
    assert "from product_profile import" in open("dashboard.py").read()
    assert "from product_profile import" in open("worker.py").read()


def test_product_profile_validate_overlay_rejects_deny_keys():
    for key in product_profile.DENY_KEYS:
        with pytest.raises(product_profile.ProductProfileError):
            product_profile.validate_overlay({key: "x"})


def test_product_profile_validate_overlay_passes_safe_keys():
    product_profile.validate_overlay({"label": "ok", "theme": "light"})


def test_api_title_returns_profile_specific_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.api_title() == "MaintenanceOS V1 Pilot"
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    assert product_profile.api_title() == "WorkSmart OS"


def test_page_title_returns_profile_specific_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.page_title() == "MaintenanceOS V1"
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    assert product_profile.page_title() == "WorkSmart OS"


def test_worker_banner_returns_profile_specific_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.worker_banner() == "MaintenanceOS V1 worker running"
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    assert product_profile.worker_banner() == "WorkSmart OS worker running"


def test_profile_defaults_to_maintenanceos_when_unset(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.profile() == "maintenanceos"


def test_profile_respects_worksmartos_env(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    assert product_profile.profile() == "worksmartos"


def test_health_returns_correct_title_based_on_profile(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    body = TestClient(api.app).get("/health").json()
    assert body["product_title"] == "MaintenanceOS V1 Pilot"
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    body = TestClient(api.app).get("/health").json()
    assert body["product_title"] == "WorkSmart OS"
    monkeypatch.setenv("PRODUCT_PROFILE", "not-a-profile")
    body = TestClient(api.app).get("/health").json()
    assert body["product_title"] == "MaintenanceOS V1 Pilot"


def test_product_profile_module_imports_clean():
    if "product_profile" in sys.modules:
        importlib.reload(product_profile)
    else:
        importlib.import_module("product_profile")
    source = open("product_profile.py").read()
    for forbidden in ("provider_runtime", "gemini_voice", "google.genai", "twilio"):
        assert forbidden not in source


def test_deny_keys_set_has_exactly_six_keys():
    assert len(product_profile.DENY_KEYS) == 6
    assert product_profile.DENY_KEYS == {
        "retention",
        "voice",
        "telephony",
        "market",
        "dispatch",
        "credential",
    }


def test_allowed_profiles_set_has_two_profiles():
    assert product_profile.ALLOWED_PROFILES == {"maintenanceos", "worksmartos"}
