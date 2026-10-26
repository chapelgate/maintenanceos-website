import os
import sys
import pytest
from unittest.mock import patch


def test_blank_profile_is_maintenanceos(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    import product_profile

    assert product_profile.profile_ready() is True
    assert product_profile.api_title() == "MaintenanceOS V1 Pilot"
    assert product_profile.page_title() == "MaintenanceOS V1"
    assert product_profile.worker_banner() == "MaintenanceOS V1 worker running"


def test_worksmartos_changes_presentation_only(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    if "product_profile" in sys.modules:
        del sys.modules["product_profile"]
    import product_profile

    assert product_profile.profile_ready() is True
    assert product_profile.api_title() == "WorkSmart OS"
    assert product_profile.page_title() == "WorkSmart OS"
    assert product_profile.worker_banner() == "WorkSmart OS worker running"


def test_unknown_profile_fails_closed(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "unknown")
    if "product_profile" in sys.modules:
        del sys.modules["product_profile"]
    import product_profile

    assert product_profile.profile_ready() is False
    with pytest.raises(product_profile.ProductProfileError):
        product_profile.api_title()


@pytest.mark.parametrize("deny_key", ["retention", "voice", "telephony", "market", "dispatch", "credential"])
def test_overlay_is_rejected(deny_key):
    import product_profile

    overlay = {deny_key: "some_value"}
    with pytest.raises(product_profile.ProductProfileError) as exc_info:
        product_profile.validate_overlay(overlay)
    assert deny_key in str(exc_info.value)


def test_wiring_uses_profile_helpers():
    # Read files as text - do not import them
    base = os.path.join(os.path.dirname(__file__), "..")
    api_path = os.path.join(base, "api.py")
    dashboard_path = os.path.join(base, "dashboard.py")
    worker_path = os.path.join(base, "worker.py")
    readiness_path = os.path.join(base, "readiness.py")

    with open(api_path) as f:
        api_content = f.read()
    with open(dashboard_path) as f:
        dashboard_content = f.read()
    with open(worker_path) as f:
        worker_content = f.read()
    with open(readiness_path) as f:
        readiness_content = f.read()

    # Check that they use the profile helpers
    assert "product_profile" in api_content
    assert "product_profile" in dashboard_content
    assert "product_profile" in worker_content
    assert "product_profile" in readiness_content

    # Check specific helpers are used
    assert "api_title" in api_content or "page_title" in api_content
    assert "page_title" in dashboard_content
    assert "worker_banner" in worker_content


def test_profile_module_imports_no_voice_stack():
    import product_profile
    import inspect

    source = inspect.getsource(product_profile)

    # These should NOT be imported in product_profile.py
    forbidden_imports = [
        "provider_runtime",
        "gemini_voice",
        "voice.telephony",
        "voice.telephony.call",
        "google.genai",
        "google.ai",
    ]

    for forbidden in forbidden_imports:
        assert forbidden not in source, f"Forbidden import found: {forbidden}"

    # Deny-key string literals are allowed
    assert "retention" in source
    assert "voice" in source
    assert "telephony" in source
    assert "market" in source
    assert "dispatch" in source
    assert "credential" in source