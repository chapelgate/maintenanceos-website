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
GEMINI_VOICE_DEFAULT = "Aoede"
MAX_MEDIA_PAYLOAD_BYTES = 64 * 1024
MAX_SEQUENCE_KEYS = 100_000

SYSTEM_PROMPT = """You are Chapelgate's telephone receptionist in the UK.
Speak natural conversational British English: warm, concise, professional, and human-sounding.
Start with exactly: Hi, thank you for calling Chapel Gate. How can we help you today?
Listen fully before replying. Ask one useful question at a time and avoid sounding like a checklist.
Keep replies short and responsive. Avoid long silent pauses between questions or pieces of information. If you need a moment to process something, use a brief natural acknowledgement such as 'Okay' or 'Thanks' rather than leaving the caller wondering whether the line has disconnected. Do not add unnecessary filler.

For repair or maintenance enquiries, obtain the caller's name, callback/contact number, and their own address. Also obtain what the problem is and enough relevant detail to make the job actionable. Ask when it started and urgency only when useful.

ALLEY-GATE REPAIR RULE: If the caller reports an alley-gate repair, gate lock fault, damaged gate, or another problem with a Chapelgate alley gate, you MUST obtain:
1. whether the gate is in Wirral or Sefton;
2. the gate number (ask naturally: 'Do you know the gate number?');
3. the problem with the gate;
4. the caller's name;
5. the caller's own address; and
6. their callback/contact number.
If the caller knows the gate number, DO NOT ask for the gate's street/location because Chapelgate can identify the gate from its number. If the gate number is unknown, then ask for enough gate location information to identify it. Never invent a gate number.

KEY ENQUIRY RULE: If the caller wants to order an alley-gate key, explain concisely that keys are ordered through alleygates.co.uk and that the current price is £22 including VAT and recorded delivery. Direct them to www.alleygates.co.uk for the ordering information and current details. Do not invent alternative prices, ordering routes, availability, or delivery promises.
If the caller says they cannot use the website, cannot order or pay online, or otherwise cannot use the online payment route, explain that they will need to speak directly to a member of the Chapelgate team so the team can arrange another way to take payment. Say this may be cash or bank transfer, but do not promise either method because the team must agree the arrangement. Tell the caller it is best to speak to a member of the team about it. Treat this as a reason for human handoff once the caller is ready; do not keep directing them back to the website.

REPAIR TIMESCALE RULE: If a caller asks how long a repair will take, say someone will be able to look at it within 24 to 48 hours. Explain that if parts are needed, such as a new cylinder, completion can take anywhere from two to four weeks because Chapelgate is currently experiencing long lead times. Do not promise completion within 24 to 48 hours; that is the timeframe for someone to look at the repair.

A job reference will be supplied to you in the live-call context. For a repair/maintenance intake, before ending, briefly read back the important collected details and tell the caller their job reference. Do not claim a contractor has been booked or dispatched unless the backend explicitly confirms it.
Never invent bookings, contractor dispatches, notifications, refunds, compensation, private account information, or safety assurances. If you do not know, say so.
Routine maintenance words are not automatically emergencies. Only advise 999 for a credible immediate threat to life or serious injury. Never say 911.
Do not proactively offer a human. If the caller clearly asks for a person or manager, or says they cannot use the online ordering/payment route and therefore need an alternative payment arrangement, end the media stream so the existing Twilio fail-closed transfer path can continue to the configured human number.
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
        call_sid = str(start.get("callSid") or "")
        job_reference = f"CG-{call_session_id:06d}"

        model = os.getenv("GEMINI_LIVE_MODEL", GEMINI_MODEL_DEFAULT).strip() or GEMINI_MODEL_DEFAULT
        voice = os.getenv("GEMINI_LIVE_VOICE", GEMINI_VOICE_DEFAULT).strip() or GEMINI_VOICE_DEFAULT
        client = genai.Client(api_key=gemini_api_key())
        config = types.LiveConnectConfig(
            response_modalities=["AUDIO"],
            system_instruction=SYSTEM_PROMPT + f"\nThe job reference for this call is {job_reference}.",
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                )
            ),
        )

        async with client.aio.live.connect(model=model, config=config) as session:
            operational_event("gemini_live_connected", call_session_id=call_session_id)

            async def twilio_to_gemini() -> None:
                nonlocal lifecycle_closed
                while True:
                    message = await websocket.receive_text()
                    event = json.loads(message)
                    if not websocket_event_within_limit(event):
                        raise vb.VoiceProtocolError("oversized_or_invalid_websocket_event")
                    event_type = event.get("event")
                    if event_type == "media":
                        payload = base64.b64decode((event.get("media") or {}).get("payload") or "", validate=True)
                        if len(payload) > MAX_MEDIA_PAYLOAD_BYTES:
                            raise vb.VoiceProtocolError("media_payload_too_large")
                        await session.send_realtime_input(
                            audio=types.Blob(data=twilio_mulaw_to_gemini_pcm(payload), mime_type="audio/pcm;rate=16000")
                        )
                    elif event_type == "dtmf" and str((event.get("dtmf") or {}).get("digit") or "") == "0":
                        transfer_required.set()
                        return
                    elif event_type == "stop":
                        stop_received.set()
                        return

            async def gemini_to_twilio() -> None:
                while not stop_received.is_set() and not transfer_required.is_set():
                    async for response in session.receive():
                        data = getattr(response, "data", None)
                        if data:
                            payload = base64.b64encode(gemini_pcm_to_twilio_mulaw(data)).decode("ascii")
                            await websocket.send_text(json.dumps({
                                "event": "media", "streamSid": stream_sid, "media": {"payload": payload}
                            }))
                        text = getattr(response, "text", None)
                        if text and _explicit_human_request(text):
                            transfer_required.set()
                            return
                        if stop_received.is_set() or transfer_required.is_set():
                            return

            inbound_task = asyncio.create_task(twilio_to_gemini())
            outbound_task = asyncio.create_task(gemini_to_twilio())
            done, pending = await asyncio.wait(
                {inbound_task, outbound_task}, return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()
            for task in done:
                task.result()
            for task in pending:
                with suppress(asyncio.CancelledError):
                    await task

        if transfer_required.is_set():
            vb._request_live_human_transfer(call_sid)
        elif stop_received.is_set():
            lifecycle_closed = True
            vb.close_call_session(call_session_id)

    except Exception as exc:
        operational_event("gemini_live_error", call_session_id=call_session_id, error=type(exc).__name__)
        if call_session_id:
            vb.record_call_interruption(call_session_id, "gemini_live_error")
    finally:
        if call_session_id:
            vb._ACTIVE_CALL_SESSIONS.discard(call_session_id)
        if not lifecycle_closed and call_session_id and stop_received.is_set():
            with suppress(Exception):
                vb.close_call_session(call_session_id)
        await vb._safe_close(websocket)
