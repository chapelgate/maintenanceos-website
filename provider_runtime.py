"""Provider-aware voice runtime without weakening the existing OpenAI bridge."""

from __future__ import annotations

import os
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import Any

import voice_bridge as openai_voice
from gemini_voice import gemini_ready, handle_gemini_media_stream
from security import app_secret_ready
from tenant_security import isolated_voice_tenant_ready
from webhook_security import dedicated_test_number_ready, public_provider_ingress_ready

SUPPORTED_PROVIDERS = frozenset({"openai", "gemini"})


@dataclass(frozen=True)
class VoiceProviderAdapter:
    """Explicit allowlisted boundary between MaintenanceOS and a realtime AI provider."""

    name: str
    ready: Callable[[], bool]
    handle_media_stream: Callable[[Any], Awaitable[None]]


def voice_provider() -> str:
    return os.getenv("VOICE_PROVIDER", "openai").strip().lower()


def _provider_adapters() -> dict[str, VoiceProviderAdapter]:
    # Build on access so test/runtime monkeypatching cannot leave stale callables behind.
    return {
        "gemini": VoiceProviderAdapter("gemini", gemini_ready, handle_gemini_media_stream),
        "openai": VoiceProviderAdapter(
            "openai", openai_voice.voice_ready, openai_voice.handle_twilio_media_stream
        ),
    }


def provider_adapter(name: str | None = None) -> VoiceProviderAdapter | None:
    return _provider_adapters().get((name or voice_provider()).strip().lower())


def transport_ready() -> bool:
    return bool(
        openai_voice.realtime_enabled()
        and public_provider_ingress_ready()
        and openai_voice.public_stream_url()
        and os.getenv("TWILIO_ACCOUNT_SID")
        and os.getenv("TWILIO_AUTH_TOKEN")
        and dedicated_test_number_ready()
        and os.getenv("VERIFY_TWILIO_SIGNATURES", "false").lower() == "true"
        and app_secret_ready()
        and isolated_voice_tenant_ready(lambda: openai_voice.SessionLocal())
    )


def provider_ready() -> bool:
    adapter = provider_adapter()
    return bool(transport_ready() and adapter and adapter.ready())


async def handle_provider_media_stream(websocket) -> None:
    adapter = provider_adapter()
    if adapter is None:
        await openai_voice._safe_close(websocket, 1008)
        return
    await adapter.handle_media_stream(websocket)
