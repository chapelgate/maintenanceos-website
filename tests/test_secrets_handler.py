"""Tests for Universal Secrets Handler (presence only; no live secrets)."""

import secrets_handler as sh


def test_presence_map_boolean_only(monkeypatch, tmp_path):
    monkeypatch.delenv("DIGITALOCEAN_TOKEN", raising=False)
    monkeypatch.delenv("DIGITALOCEAN_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("DO_API_TOKEN", raising=False)
    (tmp_path / "DIGITALOCEAN_TOKEN").write_text("dop_v1_test_only_not_real_000")
    assert sh.get_secret("DIGITALOCEAN_TOKEN", secrets_dir=tmp_path, load_dotenv=False).startswith("dop_v1_")
    presence = sh.presence_map(["DIGITALOCEAN_TOKEN", "RESEND_API_KEY"], secrets_dir=tmp_path)
    assert presence["DIGITALOCEAN_TOKEN"] is True
    assert presence["RESEND_API_KEY"] is False
    assert all(isinstance(v, bool) for v in presence.values())


def test_resend_alias_from_smtp_password(monkeypatch, tmp_path):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.setenv("SMTP_USERNAME", "resend")
    monkeypatch.setenv("SMTP_PASSWORD", "re_test_key_for_unit")
    assert sh.get_secret("RESEND_API_KEY", secrets_dir=tmp_path, load_dotenv=False) == "re_test_key_for_unit"


def test_voice_does_not_require_resend(monkeypatch, tmp_path):
    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    monkeypatch.setenv("TWILIO_ACCOUNT_SID", "ACtest")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "token")
    monkeypatch.setenv("TWILIO_PHONE_NUMBER", "+440000")
    voice = sh.voice_provider_credentials_ready()
    assert voice["openai_or_gemini"] is True
    assert voice["twilio_core"] is True
    assert voice["resend_optional_for_voice"] is False
