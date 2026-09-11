import importlib


def _module():
    return importlib.import_module("rsfm_integration")


def test_rsfm_adapter_disabled_by_default(monkeypatch):
    monkeypatch.delenv("MAINTENANCEOS_RSFM_INTEGRATION_ENABLED", raising=False)
    module = _module()
    assert module.publish_control_event("test", {"ok": True}) is False


def test_generic_rsfm_env_cannot_enable_maintenanceos(monkeypatch):
    monkeypatch.delenv("MAINTENANCEOS_RSFM_INTEGRATION_ENABLED", raising=False)
    monkeypatch.setenv("RSFM_INTEGRATION_ENABLED", "1")
    monkeypatch.setenv("RSFM_CONTROL_PLANE_TOKEN", "generic-token-must-not-be-used")
    monkeypatch.setenv("RSFM_CONTROL_PLANE_URL", "https://rsfm.example.invalid")
    module = _module()
    assert module._config() is None


def test_rsfm_adapter_incomplete_dedicated_config_fails_open(monkeypatch):
    monkeypatch.setenv("MAINTENANCEOS_RSFM_INTEGRATION_ENABLED", "1")
    monkeypatch.delenv("RSFM_CONTROL_PLANE_URL", raising=False)
    monkeypatch.delenv("RSFM_MAINTENANCEOS_TOKEN", raising=False)
    module = _module()
    assert module.publish_control_event("test", {"ok": True}) is False


def test_rsfm_adapter_uses_dedicated_maintenanceos_config(monkeypatch):
    monkeypatch.setenv("MAINTENANCEOS_RSFM_INTEGRATION_ENABLED", "1")
    monkeypatch.setenv("RSFM_CONTROL_PLANE_URL", "https://rsfm.example.invalid")
    monkeypatch.setenv("RSFM_MAINTENANCEOS_TOKEN", "maintenanceos-dedicated-token")
    monkeypatch.setenv("RSFM_TENANT_ID", "chapelgate")
    monkeypatch.setenv("RSFM_CONTROL_PLANE_TOKEN", "generic-token-must-not-be-used")
    module = _module()
    assert module._config() == (
        "https://rsfm.example.invalid",
        "maintenanceos-dedicated-token",
        "chapelgate",
    )
