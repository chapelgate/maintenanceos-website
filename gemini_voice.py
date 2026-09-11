"""Gemini Live provider for MaintenanceOS Twilio Media Streams.

This provider is deliberately isolated from the audited core lifecycle/safety logic.
It reuses the existing voice_bridge session, tenant, signature, transcript and
fail-closed primitives rather than duplicating consequential business logic.
"""

from __future__ import annotations

import asyncio
import base64
import json
import os
import struct
from contextlib import suppress

from fastapi import WebSocket
from google import genai
from google.genai import types

from ingress_security import websocket_event_within_limit, websocket_rate_allowed
from operational_logging import operational_event
from webhook_security import validate_twilio_websocket

GEMINI_MODEL_DEFAULT = "gemini-3.1-flash-live-preview"
GEMINI_VOICE_DEFAULT = "Kore"
MAX_MEDIA_PAYLOAD_BYTES = 64 * 1024
MAX_SEQUENCE_KEYS = 100_000

SYSTEM_PROMPT = """You are Chapelgate's telephone receptionist in the UK.
Speak natural British English with a calm professional British voice.
Start with exactly: Chapelgate. How can I help?
Listen fully before replying and ask one useful question at a time.
Collect caller name, callback number, address/location, any job/reference/gate number,
what happened, when it started, and urgency. Read back the important details before ending.
Never invent bookings, contractor dispatches, notifications, refunds, compensation,
private account information, or safety assurances. If you do not know, say so.
Routine maintenance words are not automatically emergencies. Only advise 999 for a
credible immediate threat to life or serious injury. Never say 911.
If the caller clearly asks for a person or manager, end the media stream so the
existing Twilio fail-closed transfer path can continue to the configured human number.
The deterministic MaintenanceOS safety engine remains authoritative for downstream actions.
"""


def gemini_api_key() -> str:
    return (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or "").strip()


def gemini_ready() -> bool:
    return bool(gemini_api_key())


def _mulaw_decode_byte(value: int) -> int:
    value = (~value) & 0xFF
    sign = value & 0x80
    exponent = (value >> 4) & 0x07
    mantissa = value & 0x0F
    sample = ((mantissa << 3) + 0x84) << exponent
    sample -= 0x84
    return -sample if sign else sample


def mulaw_to_pcm16(data: bytes) -> bytes:
    return b"".join(struct.pack("<h", max(-32768, min(32767, _mulaw_decode_byte(b)))) for b in data)


def _pcm16_samples(data: bytes) -> list[int]:
    if len(data) % 2:
        data = data[:-1]
    if not data:
        return []
    return list(struct.unpack("<" + "h" * (len(data) // 2), data))


def _samples_to_pcm16(samples: list[int]) -> bytes:
    if not samples:
        return b""
    clipped = [max(-32768, min(32767, int(v))) for v in samples]
    return struct.pack("<" + "h" * len(clipped), *clipped)


def resample_pcm16(data: bytes, src_rate: int, dst_rate: int) -> bytes:
    samples = _pcm16_samples(data)
    if not samples or src_rate <= 0 or dst_rate <= 0 or src_rate == dst_rate:
        return data
    out_len = max(1, int(round(len(samples) * dst_rate / src_rate)))
    if len(samples) == 1:
        return _samples_to_pcm16([samples[0]] * out_len)
    scale = (len(samples) - 1) / max(1, out_len - 1)
    out: list[int] = []
    for i in range(out_len):
        pos = i * scale
        left = int(pos)
        right = min(left + 1, len(samples) - 1)
        frac = pos - left
        out.append(round(samples[left] * (1.0 - frac) + samples[right] * frac))
    return _samples_to_pcm16(out)


def twilio_mulaw_to_gemini_pcm(data: bytes) -> bytes:
    return resample_pcm16(mulaw_to_pcm16(data), 8000, 16000)


def _linear_to_mulaw(sample: int) -> int:
    sample = max(-32768, min(32767, sample))
    sign = 0x80 if sample < 0 else 0
    if sample < 0:
        sample = -sample
    sample = min(sample, 32635) + 0x84
    exponent = 7
    mask = 0x4000
    while exponent > 0 and not (sample & mask):
        exponent -= 1
        mask >>= 1
    mantissa = (sample >> (exponent + 3)) & 0x0F
    return (~(sign | (exponent << 4) | mantissa)) & 0xFF


def pcm16_to_mulaw(data: bytes) -> bytes:
    return bytes(_linear_to_mulaw(sample) for sample in _pcm16_samples(data))


def gemini_pcm_to_twilio_mulaw(data: bytes) -> bytes:
    return pcm16_to_mulaw(resample_pcm16(data, 24000, 8000))


def _explicit_human_request(text: str) -> bool:
    lowered = (text or "").casefold()
    return any(phrase in lowered for phrase in (
        "speak to a person", "speak to someone", "speak to a human",
        "speak to the manager", "talk to a person", "talk to someone",
        "put me through", "transfer me", "get me a person",
    ))


async def handle_gemini_media_stream(websocket: WebSocket) -> None:
    import voice_bridge as vb

    if not websocket_rate_allowed(websocket):
        operational_event("websocket_rejected", transport="twilio", outcome="rate_limited")
        await vb._safe_close(websocket, 1013)
        return
    if not gemini_ready() or not validate_twilio_websocket(vb.public_stream_url(), websocket.headers.get("X-Twilio-Signature", "")):
        operational_event("websocket_rejected", transport="twilio", outcome="gemini_policy_rejected")
        await vb._safe_close(websocket, 1008)
        return

    await websocket.accept()
    call_session_id = None
    lifecycle_closed = False
    stop_received = asyncio.Event()
    transfer_required = asyncio.Event()

    try:
        first_event = await vb._receive_twilio_start(websocket)
        start = first_event.get("start") or {}
        params = start.get("customParameters") or {}
        call_session_id = vb.validate_stream_start(start, params)
        if not call_session_id or call_session_id in vb._ACTIVE_CALL_SESSIONS:
            raise vb.VoiceProtocolError("invalid_or_duplicate_call_session")
        vb._ACTIVE_CALL_SESSIONS.add(call_session_id)
        stream_sid = str(start.get("streamSid") or "")

        model = os.getenv("GEMINI_LIVE_MODEL", GEMINI_MODEL_DEFAULT).strip() or GEMINI_MODEL_DEFAULT
        voice = os.getenv("GEMINI_LIVE_VOICE", GEMINI_VOICE_DEFAULT).strip() or GEMINI_VOICE_DEFAULT
        client = genai.Client(api_key=gemini_api_key())
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            system_instruction=SYSTEM_PROMPT,
            input_audio_transcription=types.AudioTranscriptionConfig(),
            output_audio_transcription=types.AudioTranscriptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                )
            ),
        )

        async with client.aio.live.connect(model=model, config=config) as session:
            operational_event("gemini_live_connected", transport="gemini", outcome="connected")
            await session.send_realtime_input(text="The phone call has just connected. Greet the caller now exactly as instructed, then listen.")
            seen_sequences: set[str] = set()

            async def request_human_transfer() -> None:
                nonlocal lifecycle_closed
                if transfer_required.is_set():
                    return
                transfer_required.set()
                with suppress(Exception):
                    vb.record_call_interruption(call_session_id, "caller_requested_human")
                await vb._safe_close(websocket, 1000)
                if not lifecycle_closed:
                    with suppress(Exception):
                        vb.close_call_session(call_session_id)
                        lifecycle_closed = True

            async def from_twilio() -> None:
                nonlocal lifecycle_closed
                async for raw in websocket.iter_text():
                    if not websocket_event_within_limit(raw):
                        raise vb.VoiceProtocolError("twilio_event_too_large")
                    event = json.loads(raw)
                    if not isinstance(event, dict):
                        raise vb.VoiceProtocolError("invalid_twilio_event")
                    sequence = str(event.get("sequenceNumber") or "")
                    if sequence and sequence in seen_sequences:
                        continue
                    if sequence:
                        seen_sequences.add(sequence)
                        if len(seen_sequences) > MAX_SEQUENCE_KEYS:
                            raise vb.VoiceProtocolError("too_many_twilio_events")
                    event_type = event.get("event", "")
                    if event_type == "media":
                        payload = str((event.get("media") or {}).get("payload") or "")
                        try:
                            decoded = base64.b64decode(payload, validate=True)
                        except (ValueError, TypeError):
                            raise vb.VoiceProtocolError("invalid_twilio_media")
                        if not decoded or len(decoded) > MAX_MEDIA_PAYLOAD_BYTES:
                            raise vb.VoiceProtocolError("invalid_twilio_media")
                        await session.send_realtime_input(
                            audio=types.Blob(data=twilio_mulaw_to_gemini_pcm(decoded), mime_type="audio/pcm;rate=16000")
                        )
                    elif event_type == "dtmf" and str((event.get("dtmf") or {}).get("digit")) == "0":
                        await request_human_transfer()
                        return
                    elif event_type == "stop":
                        stop_received.set()
                        with suppress(Exception):
                            await session.send_realtime_input(audio_stream_end=True)
                        if not lifecycle_closed:
                            with suppress(Exception):
                                vb.close_call_session(call_session_id)
                                lifecycle_closed = True
                        return

            async def from_gemini() -> None:
                async for response in session.receive():
                    content = response.server_content
                    if not content:
                        continue
                    if getattr(content, "interrupted", False):
                        await websocket.send_json({"event": "clear", "streamSid": stream_sid})
                    input_tx = getattr(content, "input_transcription", None)
                    if input_tx and getattr(input_tx, "text", None):
                        text = str(input_tx.text)
                        with suppress(Exception):
                            vb.record_transcript_segment(call_session_id, "Caller", text)
                        if _explicit_human_request(text):
                            await request_human_transfer()
                            return
                    output_tx = getattr(content, "output_transcription", None)
                    if output_tx and getattr(output_tx, "text", None):
                        with suppress(Exception):
                            vb.record_transcript_segment(call_session_id, "Assistant", str(output_tx.text))
                    model_turn = getattr(content, "model_turn", None)
                    if model_turn and getattr(model_turn, "parts", None):
                        for part in model_turn.parts:
                            inline = getattr(part, "inline_data", None)
                            audio = getattr(inline, "data", None) if inline else None
                            if audio:
                                ulaw = gemini_pcm_to_twilio_mulaw(bytes(audio))
                                await websocket.send_json({
                                    "event": "media",
                                    "streamSid": stream_sid,
                                    "media": {"payload": base64.b64encode(ulaw).decode("ascii")},
                                })

            twilio_task = asyncio.create_task(from_twilio())
            gemini_task = asyncio.create_task(from_gemini())
            done, pending = await asyncio.wait({twilio_task, gemini_task}, return_when=asyncio.FIRST_COMPLETED)
            for task in done:
                error = task.exception()
                if error:
                    raise error
            if not stop_received.is_set() and not transfer_required.is_set():
                with suppress(Exception):
                    vb.record_call_interruption(call_session_id, "gemini_transport_disconnected")
            for task in pending:
                task.cancel()
            await asyncio.gather(*pending, return_exceptions=True)
    except Exception as exc:
        operational_event("gemini_voice_failure", transport="gemini", outcome=type(exc).__name__)
        if call_session_id:
            with suppress(Exception):
                vb.record_call_interruption(call_session_id, f"gemini_bridge_failure:{type(exc).__name__}")
        await vb._safe_close(websocket, 1000 if call_session_id else 1008)
    finally:
        if call_session_id:
            if not lifecycle_closed:
                with suppress(Exception):
                    vb.close_call_session(call_session_id)
            vb._ACTIVE_CALL_SESSIONS.discard(call_session_id)
