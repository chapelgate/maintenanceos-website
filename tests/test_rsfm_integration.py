import importlib


def test_rsfm_adapter_disabled_by_default(monkeypatch):
    monkeypatch.delenv("RSFM_INTEGRATION_ENABLED", raising=False)
    module = importlib.import_module("rsfm_integration")
    assert module.publish_control_event("test", {"ok": True}) is False


def test_rsfm_adapter_incomplete_config_fails_open(monkeypatch):
    monkeypatch.setenv("RSFM_INTEGRATION_ENABLED", "1")
    monkeypatch.delenv("RSFM_CONTROL_PLANE_URL", raising=False)
    monkeypatch.delenv("RSFM_CONTROL_PLANE_TOKEN", raising=False)
    module = importlib.import_module("rsfm_integration")
    assert module.publish_control_event("test", {"ok": True}) is False
