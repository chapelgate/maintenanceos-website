import importlib

import pytest
from fastapi.testclient import TestClient

import api
import release_manifest


def test_release_manifest_module_exists():
    mod = importlib.import_module("release_manifest")
    assert hasattr(mod, "manifest")


def test_manifest_reports_fail_closed_gates(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    sha = "a" * 40
    data = release_manifest.manifest(sha)
    assert data["git_sha"] == sha
    assert data["data_lifecycle_runtime_ready"] is False
    assert data["external_identity_runtime_ready"] is False
    assert data["social_housing_runtime_ready"] is False
    assert data["retention_policy_configured"] is False
    assert data["profile_ready"] is True


def test_manifest_omits_secret_env_values(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    monkeypatch.setenv("INTERNAL_API_TOKEN", "t" * 32)
    data = release_manifest.manifest("b" * 40)
    blob = str(data)
    assert "s" * 32 not in blob
    assert "t" * 32 not in blob


def test_bad_sha_rejected():
    with pytest.raises(ValueError):
        release_manifest.manifest("deadbeef")


def test_no_openapi_docs_served():
    assert api.app.docs_url is None
    assert api.app.redoc_url is None
    assert api.app.openapi_url is None
    client = TestClient(api.app)
    assert client.get("/docs").status_code in {404, 405}
    assert client.get("/redoc").status_code in {404, 405}
    assert client.get("/openapi.json").status_code in {404, 405}


def test_manifest_module_does_not_import_voice():
    source = open("release_manifest.py").read()
    for forbidden in ("provider_runtime", "gemini_voice", "twilio", "voice.telephony"):
        assert forbidden not in source
