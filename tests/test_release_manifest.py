import json

import pytest

import commercial_release_controls as crc
from product_profile import profile, profile_ready

import release_manifest

_GOOD_SHA = "a" * 40
_OPENAI_SENTINEL = "synthetic-openai-sentinel-mos06"
_TWILIO_SENTINEL = "synthetic-twilio-sentinel-mos06"
_FIELDS = (
    "data_lifecycle_runtime_ready",
    "external_identity_runtime_ready",
    "git_sha",
    "product_profile",
    "profile_ready",
    "retention_policy_configured",
    "social_housing_runtime_ready",
)


def test_manifest_reports_current_fail_closed_gates(monkeypatch):
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    payload = release_manifest.manifest(_GOOD_SHA)
    assert list(payload) == list(_FIELDS)
    assert payload["git_sha"] == _GOOD_SHA
    assert payload["product_profile"] == profile()
    assert payload["profile_ready"] is profile_ready()
    assert payload["retention_policy_configured"] is crc.retention_policy_configured()
    assert payload["data_lifecycle_runtime_ready"] is crc.data_lifecycle_runtime_ready()
    assert payload["external_identity_runtime_ready"] is crc.external_identity_runtime_ready()
    assert payload["social_housing_runtime_ready"] is crc.social_housing_runtime_ready()
    assert crc.data_lifecycle_runtime_ready() is False
    assert crc.external_identity_runtime_ready() is False
    assert json.dumps(payload) == json.dumps(release_manifest.manifest(_GOOD_SHA))
    upper = "ABCDEF" + "0123456789abcdef" * 2 + "12"
    assert release_manifest.manifest(upper)["git_sha"] == upper
    monkeypatch.setenv("PRODUCT_PROFILE", "not-a-profile")
    closed = release_manifest.manifest(_GOOD_SHA)
    assert closed["profile_ready"] is profile_ready()
    assert closed["profile_ready"] is False
    assert closed["product_profile"] == ""
    assert "not-a-profile" not in json.dumps(closed)


def test_manifest_omits_secret_env_values(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", _OPENAI_SENTINEL)
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", _TWILIO_SENTINEL)
    dumped = json.dumps(release_manifest.manifest(_GOOD_SHA))
    assert _OPENAI_SENTINEL not in dumped
    assert _TWILIO_SENTINEL not in dumped


@pytest.mark.parametrize(
    "bad",
    ["", "abc", "g" * 40, "a" * 39, "a" * 41, "a" * 39 + "g", " " + "a" * 39, None, 40],
)
def test_bad_sha_is_rejected(bad):
    with pytest.raises((ValueError, TypeError)):
        release_manifest.manifest(bad)


def test_manifest_module_does_not_import_voice():
    with open("release_manifest.py", encoding="utf-8") as handle:
        source = handle.read().lower()
    for token in (
        "voice",
        "telephony",
        "gemini",
        "readiness",
        "configure_test_credentials",
        "secrets_handler",
        "google",
        "twilio",
        "openai",
    ):
        assert token not in source
