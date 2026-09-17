"""Provider-aware voice runtime without weakening the existing OpenAI bridge."""

from __future__ import annotations

import os

import voice_bridge as openai_voice
from gemini_voice import gemini_ready, handle_gemini_media_stream
from security import app_secret_ready
from tenant_security import isolated_voice_tenant_ready
from models import SessionLocal
from webhook_security import dedicated_test_number_ready, public_provider_ingress_ready

SUPPORTED_PROVIDERS = {"openai", "gemini"}


def voice_provider() -> str:
    return os.getenv("VOICE_PROVIDER", "openai").strip().lower()


def provider_ready() -> bool:
    common = bool(
        openai_voice.realtime_enabled()
        and public_provider_ingress_ready()
        and openai_voice.public_stream_url()
        and os.getenv("TWILIO_ACCOUNT_SID")
        and os.getenv("TWILIO_AUTH_TOKEN")
        and dedicated_test_number_ready()
        and os.getenv("VERIFY_TWILIO_SIGNATURES", "false").lower() == "true"
        and app_secret_ready()
        and isolated_voice_tenant_ready(lambda: SessionLocal())
    )
    if not common:
        return False
    provider = voice_provider()
    if provider == "gemini":
        return gemini_ready()
    if provider == "openai":
        return openai_voice.voice_ready()
    return False


async def handle_provider_media_stream(websocket) -> None:
    provider = voice_provider()
    if provider == "gemini":
        await handle_gemini_media_stream(websocket)
        return
    if provider == "openai":
        await openai_voice.handle_twilio_media_stream(websocket)
        return
    await openai_voice._safe_close(websocket, 1008)
