import asyncio

import provider_runtime


def test_adapter_registry_is_explicit_and_allowlisted():
    adapters = provider_runtime._provider_adapters()
    assert frozenset(adapters) == provider_runtime.SUPPORTED_PROVIDERS
    assert provider_runtime.SUPPORTED_PROVIDERS == frozenset({"gemini", "openai"})
    assert all(adapter.name == name for name, adapter in adapters.items())
    assert all(callable(adapter.ready) for adapter in adapters.values())
    assert all(callable(adapter.handle_media_stream) for adapter in adapters.values())


def test_provider_adapter_normalises_explicit_name(monkeypatch):
    monkeypatch.setenv("VOICE_PROVIDER", "gemini")
    assert provider_runtime.provider_adapter().name == "gemini"
    assert provider_runtime.provider_adapter(" OPENAI ").name == "openai"
    assert provider_runtime.provider_adapter("unknown") is None


def test_gemini_stream_routes_through_selected_adapter(monkeypatch):
    calls = []

    async def fake_gemini(websocket):
        calls.append(("gemini", websocket))

    monkeypatch.setenv("VOICE_PROVIDER", "gemini")
    monkeypatch.setattr(provider_runtime, "handle_gemini_media_stream", fake_gemini)
    socket = object()
    asyncio.run(provider_runtime.handle_provider_media_stream(socket))
    assert calls == [("gemini", socket)]


def test_openai_stream_routes_through_selected_adapter(monkeypatch):
    calls = []

    async def fake_openai(websocket):
        calls.append(("openai", websocket))

    monkeypatch.setenv("VOICE_PROVIDER", "openai")
    monkeypatch.setattr(provider_runtime.openai_voice, "handle_twilio_media_stream", fake_openai)
    socket = object()
    asyncio.run(provider_runtime.handle_provider_media_stream(socket))
    assert calls == [("openai", socket)]


def test_unknown_provider_stream_fails_closed(monkeypatch):
    closes = []

    async def fake_close(websocket, code):
        closes.append((websocket, code))

    monkeypatch.setenv("VOICE_PROVIDER", "not-allowlisted")
    monkeypatch.setattr(provider_runtime.openai_voice, "_safe_close", fake_close)
    socket = object()
    asyncio.run(provider_runtime.handle_provider_media_stream(socket))
    assert closes == [(socket, 1008)]


def test_provider_readiness_short_circuits_when_transport_is_not_ready(monkeypatch):
    called = []
    adapter = provider_runtime.VoiceProviderAdapter(
        "synthetic",
        lambda: called.append("ready") or True,
        lambda websocket: None,
    )
    monkeypatch.setattr(provider_runtime, "transport_ready", lambda: False)
    monkeypatch.setattr(provider_runtime, "provider_adapter", lambda name=None: adapter)
    assert provider_runtime.provider_ready() is False
    assert called == []
