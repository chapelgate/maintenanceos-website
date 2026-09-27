import os

import gemini_voice
import provider_runtime


def test_gemini_ready_accepts_gemini_key(monkeypatch):
    monkeypatch.delenv("GOOGLE_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "synthetic-gemini-key")
    assert gemini_voice.gemini_ready() is True


def test_gemini_ready_accepts_google_key_alias(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GOOGLE_API_KEY", "synthetic-google-key")
    assert gemini_voice.gemini_ready() is True


def test_unknown_provider_fails_closed(monkeypatch):
    monkeypatch.setenv("VOICE_PROVIDER", "unknown-provider")
    assert provider_runtime.voice_provider() == "unknown-provider"
    assert provider_runtime.provider_ready() is False


def test_gemini_provider_does_not_require_openai_key(monkeypatch):
    monkeypatch.setenv("VOICE_PROVIDER", "gemini")
    monkeypatch.setenv("GEMINI_API_KEY", "synthetic-gemini-key")
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.setattr(provider_runtime.openai_voice, "realtime_enabled", lambda: True)
    monkeypatch.setattr(provider_runtime.openai_voice, "public_stream_url", lambda: "wss://example.test/voice/media-stream")
    monkeypatch.setattr(provider_runtime, "public_provider_ingress_ready", lambda: True)
    monkeypatch.setattr(provider_runtime, "dedicated_test_number_ready", lambda: True)
    monkeypatch.setattr(provider_runtime, "app_secret_ready", lambda: True)
    monkeypatch.setattr(provider_runtime, "isolated_voice_tenant_ready", lambda factory: True)
    monkeypatch.setenv("TWILIO_ACCOUNT_SID", "AC" + "1" * 32)
    monkeypatch.setenv("TWILIO_AUTH_TOKEN", "t" * 32)
    monkeypatch.setenv("VERIFY_TWILIO_SIGNATURES", "true")
    assert provider_runtime.provider_ready() is True


def test_audio_conversion_shapes_are_bounded():
    mulaw = bytes(range(256))
    pcm16 = gemini_voice.twilio_mulaw_to_gemini_pcm(mulaw)
    assert len(pcm16) > len(mulaw)
    restored = gemini_voice.gemini_pcm_to_twilio_mulaw(pcm16)
    assert restored
    assert all(0 <= value <= 255 for value in restored)


def test_transfer_is_emergency_only():
    assert gemini_voice._emergency_transfer_requested("Please put me through to a person") is False
    assert gemini_voice._emergency_transfer_requested("The gate is dangerous") is False
    assert gemini_voice._emergency_transfer_requested("This is an emergency") is True
