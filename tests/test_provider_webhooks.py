import pytest

import provider_webhooks as pw
import render_prepare


def _closed_env(monkeypatch):
    monkeypatch.setenv("PHONE_PROVIDER", "twilio")
    monkeypatch.setenv("ENABLE_PUBLIC_PROVIDER_INGRESS", "false")
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "false")
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES", "true")
    monkeypatch.setenv("PUBLIC_BASE_URL", "https://maintenanceos-redteam-v2.onrender.com")
    monkeypatch.setenv("TWILIO_PHONE_NUMBER", "+441234567890")
    monkeypatch.setenv("TWILIO_HUMAN_TRANSFER_NUMBER", "+441234567891")
    monkeypatch.setenv("TWILIO_TEST_NUMBER_CONFIRMED", "true")


def _live_incomplete_env(monkeypatch):
    _closed_env(monkeypatch)
    monkeypatch.setenv("ENABLE_PUBLIC_PROVIDER_INGRESS", "true")
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES", "false")


def _live_ready_env(monkeypatch):
    _closed_env(monkeypatch)
    monkeypatch.setenv("ENABLE_PUBLIC_PROVIDER_INGRESS", "true")
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES", "true")
    monkeypatch.setenv("TWILIO_ACCOUNT_SID", "ACaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "token-token-token-token-token-token")


def test_closed_mode_skips_webhook_mutation_and_is_success(monkeypatch):
    _closed_env(monkeypatch)

    def boom():
        raise AssertionError("Twilio webhook mutation must not occur in closed mode")

    result = pw.configure_twilio_voice_webhook(twilio_updater=boom)
    assert result["should_skip_closed_mode"] is True
    assert result["mutated"] is False
    assert result["ingress_enabled"] is False
    assert result["realtime_enabled"] is False
    assert result["status"] == pw.CLOSED_SKIP_STATUS
    assert result["message"] == pw.REFUSAL_MESSAGE
    assert pw.main([]) == 0


def test_closed_mode_still_skips_if_realtime_flag_is_true(monkeypatch):
    _closed_env(monkeypatch)
    monkeypatch.setenv("ENABLE_REALTIME_VOICE", "true")

    def boom():
        raise AssertionError("closed ingress must not configure Twilio even if realtime is true")

    result = pw.configure_twilio_voice_webhook(twilio_updater=boom)
    assert result["mutated"] is False
    assert result["realtime_enabled"] is True
    assert result["status"] == pw.CLOSED_SKIP_STATUS


def test_closed_mode_render_prepare_cli(monkeypatch, capsys):
    _closed_env(monkeypatch)
    monkeypatch.setattr(render_prepare, "ensure_synthetic_tenant", lambda: 7)
    assert render_prepare.main([]) == 0
    text = capsys.readouterr().out
    assert render_prepare.SYNTHETIC_READY in text
    assert pw.REFUSAL_MESSAGE in text
    assert pw.CLOSED_SKIP_STATUS in text
    assert render_prepare.PREPARE_PASS in text
    assert pw.READY_STATUS not in text


def test_closed_mode_cli_emits_explicit_skip_status(monkeypatch, capsys):
    _closed_env(monkeypatch)
    assert pw.main([]) == 0
    text = capsys.readouterr().out
    assert pw.REFUSAL_MESSAGE in text
    assert pw.CLOSED_SKIP_STATUS in text
    assert pw.READY_STATUS not in text


def test_unauthorised_live_ingress_fails_closed_without_mutation(monkeypatch):
    _live_incomplete_env(monkeypatch)

    def boom():
        raise AssertionError("Twilio webhook mutation must not occur when live config is incomplete")

    with pytest.raises(pw.ProviderWebhookError, match="public provider ingress is not ready"):
        pw.configure_twilio_voice_webhook(twilio_updater=boom)
    assert pw.main([]) == 1


def test_authorised_live_configuration_mutates_only_when_ready(monkeypatch):
    _live_ready_env(monkeypatch)
    calls = []

    def updater():
        calls.append("updated")

    result = pw.configure_twilio_voice_webhook(twilio_updater=updater)
    assert result["mutated"] is True
    assert result["status"] == pw.READY_STATUS
    assert calls == ["updated"]
    assert result["realtime_enabled"] is False


def test_apply_helper_refuses_when_ingress_closed(monkeypatch):
    _closed_env(monkeypatch)
    with pytest.raises(pw.ProviderWebhookError, match="public provider ingress is not ready"):
        pw.apply_twilio_incoming_phone_voice_url()


def test_phone_adapter_registry_is_explicit_and_allowlisted():
    adapters = pw._phone_provider_adapters()
    assert frozenset(adapters) == pw.SUPPORTED_PHONE_PROVIDERS
    assert pw.SUPPORTED_PHONE_PROVIDERS == frozenset({"twilio"})
    assert adapters["twilio"].name == "twilio"
    assert callable(adapters["twilio"].configure_incoming_number)


def test_phone_provider_adapter_normalises_name(monkeypatch):
    monkeypatch.setenv("PHONE_PROVIDER", " TWILIO ")
    assert pw.phone_provider() == "twilio"
    assert pw.phone_provider_adapter().name == "twilio"
    assert pw.phone_provider_adapter("unknown") is None


def test_unknown_phone_provider_fails_closed_before_mutation(monkeypatch):
    _live_ready_env(monkeypatch)
    monkeypatch.setenv("PHONE_PROVIDER", "unknown-carrier")
    calls = []

    with pytest.raises(pw.ProviderWebhookError, match="Unsupported phone provider"):
        pw.configure_phone_voice_webhook(provider_updater=lambda: calls.append("mutated"))

    assert calls == []
