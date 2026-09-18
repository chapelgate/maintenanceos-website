"""Gemini Live provider for MaintenanceOS Twilio Media Streams.

This provider is deliberately isolated from the audited core lifecycle/safety logic.
It reuses the existing voice_bridge session, tenant, signature, transcript and
fail-closed primitives rather than duplicating consequential business logic.
"""

from __future__ import annotations

import array
import asyncio
import base64
import json
import os
import struct
import time
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
If the caller says they cannot use the website, cannot order or pay online, or otherwise cannot use the online payment route, explain that they need to speak directly to a Chapelgate team member so the team can arrange another payment method. Say this may be cash or bank transfer, but the team must agree it. Treat this as a human handoff; do not keep directing them back to the website.

MASTER KEY RULE: Master keys are restricted and are not ordinary resident keys. Do not say they can be ordered through the resident-key website. Anyone wishing to apply for a master key must email info@alleygates.co.uk from an official organisation or work email address, explaining why the master key is required and providing their full name, role/organisation, postal address, contact number, area/site, and any relevant gate or reference details. This is an application only; approval is not guaranteed. Do not disclose master-key security details or promise eligibility or approval.

REPAIR TIMESCALE RULE: If a caller asks how long a repair will take, say someone will be able to look at it within 24 to 48 hours. Explain that if parts are needed, such as a new cylinder, completion can take anywhere from two to four weeks because Chapelgate is currently experiencing long lead times. Do not promise completion within 24 to 48 hours; that is the timeframe for someone to look at the repair.

A job reference will be supplied to you in the live-call context. For a repair/maintenance intake, before ending, briefly read back the important collected details and tell the caller their job reference. Do not claim a contractor has been booked or dispatched unless the backend explicitly confirms it.
CALL CLOSING RULE: If you ask whether there is anything else and the caller says no, no thanks, that's all, or otherwise confirms they are finished, you MUST reply before the call ends: 'Thank you for calling Chapel Gate. Goodbye, have a nice day.' Never end a completed routine call in silence.
Never invent bookings, contractor dispatches, notifications, refunds, compensation, private account information, or safety assurances. If you do not know, say so.
Routine maintenance words are not automatically emergencies. Only advise 999 for a credible immediate threat to life or serious injury. Never say 911.
Do not proactively offer a human. If the caller clearly asks for a person or manager, or cannot use the online ordering/payment route and needs an alternative payment arrangement, end the media stream so the existing Twilio fail-closed transfer path can continue to the configured human number.
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
    # Vectorised decode — per-sample struct.pack was a measurable audio-path cost.
    out = array.array("h", (max(-32768, min(32767, _mulaw_decode_byte(b))) for b in data))
    return out.tobytes()


def _pcm16_samples(data: bytes) -> array.array:
    if len(data) % 2:
        data = data[:-1]
    samples = array.array("h")
    if data:
        samples.frombytes(data)
    return samples


def _samples_to_pcm16(samples: array.array | list[int]) -> bytes:
    if not samples:
        return b""
    if isinstance(samples, array.array) and samples.typecode == "h":
        return samples.tobytes()
    out = array.array("h", (max(-32768, min(32767, int(v))) for v in samples))
    return out.tobytes()


def resample_pcm16(data: bytes, src_rate: int, dst_rate: int) -> bytes:
    samples = _pcm16_samples(data)
    if not samples or src_rate <= 0 or dst_rate <= 0 or src_rate == dst_rate:
        return data
    out_len = max(1, int(round(len(samples) * dst_rate / src_rate)))
    if len(samples) == 1:
        return _samples_to_pcm16(array.array("h", [samples[0]] * out_len))
    # Exact 2x upsample (8k→16k) is the Twilio→Gemini hot path.
    if dst_rate == src_rate * 2:
        out = array.array("h", [0]) * out_len
        last = len(samples) - 1
        for i, sample in enumerate(samples):
            out[i * 2] = sample
            nxt = samples[i + 1] if i < last else sample
            out[i * 2 + 1] = (sample + nxt) // 2
        return out.tobytes()
    # Exact 3x downsample (24k→8k) is the Gemini→Twilio hot path.
    if src_rate == dst_rate * 3:
        out = array.array("h")
        for i in range(0, len(samples) - 2, 3):
            out.append((samples[i] + samples[i + 1] + samples[i + 2]) // 3)
        return out.tobytes()
    scale = (len(samples) - 1) / max(1, out_len - 1)
    out = array.array("h", [0]) * out_len
    for i in range(out_len):
        pos = i * scale
        left = int(pos)
        right = min(left + 1, len(samples) - 1)
        frac = pos - left
        out[i] = int(round(samples[left] * (1.0 - frac) + samples[right] * frac))
    return out.tobytes()


def _silence_duration_ms() -> int:
    # Default 350ms keeps barge-in safe while shaving end-of-speech wait vs 450ms.
    raw = os.getenv("GEMINI_SILENCE_DURATION_MS", "350").strip()
    try:
        value = int(raw)
    except ValueError:
        value = 350
    return max(200, min(value, 1200))


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


def _needs_payment_handoff(text: str) -> bool:
    lowered = (text or "").casefold()
    positive = ("can pay online", "can use the website", "able to pay online")
    if any(p in lowered for p in positive):
        return False
    return any(p in lowered for p in ("can\'t use the website", "cannot use the website", "don\'t have internet", "no internet", "can\'t pay online", "cannot pay online", "don\'t do online banking", "pay cash", "bank transfer"))


def _explicit_human_request(text: str) -> bool:
    lowered = (text or "").casefold()
    return any(phrase in lowered for phrase in (
        "speak to a person", "speak to someone", "speak to a human",
        "speak to the manager", "talk to a person", "talk to someone",
        "put me through", "transfer me", "get me a person",
    ))


def _merge_transcription(current: str, fragment: str) -> str:
    current = (current or "").strip()
    fragment = (fragment or "").strip()
    if not fragment:
        return current
    if not current or fragment.startswith(current):
        return fragment
    if current.endswith(fragment) or current == fragment:
        return current
    return f"{current} {fragment}".strip()


def _normalize_utterance(text: str) -> str:
    lowered = (text or "").casefold().replace("’", "'").replace("‘", "'")
    cleaned = "".join(ch if ch.isalnum() or ch in {" ", "'"} else " " for ch in lowered)
    return " ".join(cleaned.split())


def _assistant_invited_close(text: str) -> bool:
    lowered = _normalize_utterance(text)
    return any(phrase in lowered for phrase in (
        "anything else i can help",
        "anything else we can help",
        "is there anything else",
        "anything more i can help",
        "help you with anything else",
        "help with anything else",
        "will that be all",
        "was there anything else",
        "need anything else",
        "anything else today",
        "anything else for you",
        "can i do anything else",
    ))


_CLOSE_EXACT = frozenset({
    "no",
    "nope",
    "nah",
    "no thanks",
    "no thank you",
    "no thanks that's all",
    "no thank you that's all",
    "that's all",
    "thats all",
    "that's everything",
    "thats everything",
    "that's it",
    "thats it",
    "no that's it",
    "no thats it",
    "nothing else",
    "nothing",
    "all done",
    "i'm fine",
    "im fine",
    "i am fine",
    "i'm good",
    "im good",
    "i'm okay",
    "im okay",
    "thanks",
    "thank you",
    "that's all thanks",
    "thats all thanks",
    "cheers",
    "okay",
    "ok",
})

_FAREWELL_EXACT = frozenset({
    "bye",
    "goodbye",
    "bye bye",
    "okay bye",
    "ok bye",
    "thanks bye",
    "thank you bye",
    "cheers bye",
    "goodbye now",
})


def _routine_close_confirmed(text: str) -> bool:
    """True for natural finished-call confirms; avoids mid-dialogue false positives."""
    lowered = _normalize_utterance(text)
    if not lowered:
        return False
    if lowered in _CLOSE_EXACT or lowered in _FAREWELL_EXACT:
        return True
    words = lowered.split()
    if len(words) <= 6 and any(
        phrase in lowered
        for phrase in (
            "no thanks",
            "no thank you",
            "that's all",
            "thats all",
            "that's everything",
            "thats everything",
            "nothing else",
            "that's it",
            "thats it",
            "all done",
            "i'm fine",
            "im fine",
        )
    ):
        return True
    return False


def _farewell_only(text: str) -> bool:
    return _normalize_utterance(text) in _FAREWELL_EXACT


async def handle_gemini_media_stream(websocket: WebSocket) -> None:
    import voice_bridge as vb

    if not websocket_rate_allowed(websocket):
        operational_event("websocket_rejected", transport="twilio", outcome="rate_limited")
        await vb._safe_close(websocket, 1013)
        return
    signature = websocket.headers.get("X-Twilio-Signature", "")
    signed_ok = validate_twilio_websocket(vb.public_stream_url(), signature)
    ready = gemini_ready()
    if not ready or not signed_ok:
        outcome = "gemini_not_ready" if not ready else "signature_rejected"
        operational_event("websocket_rejected", transport="twilio", outcome=outcome)
        # For an authenticated Twilio stream, accept then close cleanly when the
        # provider is unavailable so Twilio can continue the fallback TwiML.
        if signed_ok:
            await websocket.accept()
        await vb._safe_close(websocket, 1013 if not ready else 1008)
        return

    await websocket.accept()
    call_session_id = None
    lifecycle_closed = False
    stop_received = asyncio.Event()
    transfer_required = asyncio.Event()
    routine_close_requested = asyncio.Event()

    try:
        first_event = await vb._receive_twilio_start(websocket)
        start = first_event.get("start") or {}
        params = start.get("customParameters") or {}
        call_session_id = vb.validate_stream_start(start, params)
        if not vb.claim_active_call_session(call_session_id):
            raise vb.VoiceProtocolError("invalid_or_duplicate_call_session")
        stream_sid = str(start.get("streamSid") or "")
        call_sid = str(start.get("callSid") or "")
        job_reference = f"CG-{call_session_id:06d}"

        model = os.getenv("GEMINI_LIVE_MODEL", GEMINI_MODEL_DEFAULT).strip() or GEMINI_MODEL_DEFAULT
        voice = os.getenv("GEMINI_LIVE_VOICE", GEMINI_VOICE_DEFAULT).strip() or GEMINI_VOICE_DEFAULT
        client = genai.Client(api_key=gemini_api_key())
        silence_ms = _silence_duration_ms()
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
            # Lower end-of-speech silence without disabling barge-in safety.
            realtime_input_config=types.RealtimeInputConfig(
                automatic_activity_detection=types.AutomaticActivityDetection(
                    disabled=False,
                    start_of_speech_sensitivity=types.StartSensitivity.START_SENSITIVITY_HIGH,
                    end_of_speech_sensitivity=types.EndSensitivity.END_SENSITIVITY_HIGH,
                    prefix_padding_ms=20,
                    silence_duration_ms=silence_ms,
                ),
                activity_handling=types.ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
                turn_coverage=types.TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
            ),
            # Disable thinking budget so the live receptionist does not pay extra
            # pre-audio reasoning latency on ordinary turn-taking.
            thinking_config=types.ThinkingConfig(thinking_budget=0),
        )

        async with client.aio.live.connect(model=model, config=config) as session:
            operational_event("gemini_live_connected", transport="gemini", outcome="connected")
            await session.send_realtime_input(text=f"The phone call has just connected. This call's job reference is {job_reference}. Greet the caller now exactly as instructed, then listen.")
            seen_sequences: set[str] = set()
            transcript_buffers = {"caller": "", "assistant": ""}
            closing_prompt_seen = False
            # Latency markers (no caller PII): speech ended → model audio → Twilio send.
            turn_latency = {
                "caller_turn_ms": None,
                "gemini_turn_ms": None,
                "first_model_audio_ms": None,
                "audio_converted_ms": None,
                "first_twilio_audio_ms": None,
            }

            def _mark(stage: str) -> None:
                now_ms = int(time.monotonic() * 1000)
                turn_latency[stage] = now_ms
                base = turn_latency.get("caller_turn_ms")
                if base is None:
                    return
                if stage == "gemini_turn_ms":
                    operational_event(
                        "voice_turn_stage",
                        transport="gemini",
                        outcome="gemini_turn_accepted",
                        duration_ms=max(0, now_ms - base),
                        reason_code=f"silence_{silence_ms}",
                    )
                elif stage == "first_model_audio_ms":
                    operational_event(
                        "voice_turn_stage",
                        transport="gemini",
                        outcome="first_model_audio",
                        duration_ms=max(0, now_ms - base),
                        reason_code=f"silence_{silence_ms}",
                    )
                elif stage == "audio_converted_ms":
                    model_ms = turn_latency.get("first_model_audio_ms") or base
                    operational_event(
                        "voice_turn_stage",
                        transport="gemini",
                        outcome="audio_conversion",
                        duration_ms=max(0, now_ms - model_ms),
                        reason_code=f"silence_{silence_ms}",
                    )
                elif stage == "first_twilio_audio_ms":
                    operational_event(
                        "voice_turn_stage",
                        transport="gemini",
                        outcome="first_twilio_media",
                        duration_ms=max(0, now_ms - base),
                        reason_code=f"silence_{silence_ms}",
                    )
                    operational_event(
                        "voice_turn_latency",
                        transport="gemini",
                        outcome="measured",
                        duration_ms=max(0, now_ms - base),
                        reason_code=f"silence_{silence_ms}",
                    )

            async def _persist_segment(speaker: str, text: str) -> None:
                # Never block the realtime media loop on SQLite/Postgres writes.
                with suppress(Exception):
                    await asyncio.to_thread(vb.record_transcript_segment, call_session_id, speaker, text)

            async def close_lifecycle() -> None:
                nonlocal lifecycle_closed
                if lifecycle_closed:
                    return
                lifecycle_closed = True
                with suppress(Exception):
                    # close_call_session persists then schedules email off-thread.
                    await asyncio.to_thread(vb.close_call_session, call_session_id)

            async def request_human_transfer() -> None:
                nonlocal lifecycle_closed
                if transfer_required.is_set():
                    return
                transfer_required.set()
                transferred = False
                with suppress(Exception):
                    transferred = await asyncio.to_thread(vb._request_live_human_transfer, call_sid)
                with suppress(Exception):
                    vb.record_call_interruption(
                        call_session_id,
                        "caller_requested_human" if transferred else "human_transfer_failed",
                    )
                await vb._safe_close(websocket, 1000)
                await close_lifecycle()

            async def request_routine_close() -> None:
                if routine_close_requested.is_set():
                    return
                routine_close_requested.set()
                operational_event("routine_call_close", transport="twilio", outcome="deterministic_goodbye")
                # End the media stream first. Twilio then immediately continues the
                # post-Stream TwiML <Say>, which provides the exact goodbye without
                # waiting for another model turn.
                await vb._safe_close(websocket, 1000)
                await close_lifecycle()

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
                        with suppress(Exception):
                            await session.send_realtime_input(audio_stream_end=True)
                        # Give Gemini a short post-hangup window to emit final transcription.
                        # This is after the caller has disconnected, so it does not add call latency.
                        await asyncio.sleep(0.75)
                        for speaker, key in (("Caller", "caller"), ("Assistant", "assistant")):
                            text = transcript_buffers[key].strip()
                            if text:
                                await _persist_segment(speaker, text)
                                transcript_buffers[key] = ""
                        stop_received.set()
                        await close_lifecycle()
                        return

            async def from_gemini() -> None:
                nonlocal closing_prompt_seen
                while not stop_received.is_set() and not transfer_required.is_set() and not routine_close_requested.is_set():
                    async for response in session.receive():
                        content = response.server_content
                        if not content:
                            continue
                        if turn_latency["caller_turn_ms"] is not None and turn_latency["gemini_turn_ms"] is None:
                            _mark("gemini_turn_ms")
                        if getattr(content, "interrupted", False):
                            await websocket.send_json({"event": "clear", "streamSid": stream_sid})
                        input_tx = getattr(content, "input_transcription", None)
                        if input_tx and getattr(input_tx, "text", None):
                            text = str(input_tx.text)
                            transcript_buffers["caller"] = _merge_transcription(transcript_buffers["caller"], text)
                            finished = getattr(input_tx, "finished", None) is True
                            if finished:
                                _mark("caller_turn_ms")
                                turn_latency["gemini_turn_ms"] = None
                                turn_latency["first_model_audio_ms"] = None
                                turn_latency["audio_converted_ms"] = None
                                turn_latency["first_twilio_audio_ms"] = None
                                merged = transcript_buffers["caller"].strip()
                                if merged:
                                    await _persist_segment("Caller", merged)
                                    transcript_buffers["caller"] = ""
                                should_close = (
                                    (closing_prompt_seen and _routine_close_confirmed(merged))
                                    or _farewell_only(merged)
                                )
                                if should_close:
                                    await request_routine_close()
                                    return
                            if _explicit_human_request(text) or _needs_payment_handoff(text):
                                await request_human_transfer()
                                return
                        output_tx = getattr(content, "output_transcription", None)
                        if output_tx and getattr(output_tx, "text", None):
                            transcript_buffers["assistant"] = _merge_transcription(
                                transcript_buffers["assistant"], str(output_tx.text)
                            )
                            if _assistant_invited_close(transcript_buffers["assistant"]):
                                closing_prompt_seen = True
                            if getattr(output_tx, "finished", None) is True:
                                merged = transcript_buffers["assistant"].strip()
                                if merged:
                                    await _persist_segment("Assistant", merged)
                                    transcript_buffers["assistant"] = ""
                        if getattr(content, "turn_complete", False):
                            if turn_latency["caller_turn_ms"] is None:
                                _mark("caller_turn_ms")
                                turn_latency["gemini_turn_ms"] = None
                                turn_latency["first_model_audio_ms"] = None
                                turn_latency["audio_converted_ms"] = None
                                turn_latency["first_twilio_audio_ms"] = None
                            for speaker, key in (("Caller", "caller"), ("Assistant", "assistant")):
                                merged = transcript_buffers[key].strip()
                                if merged:
                                    await _persist_segment(speaker, merged)
                                    transcript_buffers[key] = ""
                        model_turn = getattr(content, "model_turn", None)
                        if model_turn and getattr(model_turn, "parts", None):
                            for part in model_turn.parts:
                                inline = getattr(part, "inline_data", None)
                                audio = getattr(inline, "data", None) if inline else None
                                if audio:
                                    if turn_latency["first_model_audio_ms"] is None:
                                        _mark("first_model_audio_ms")
                                    ulaw = gemini_pcm_to_twilio_mulaw(bytes(audio))
                                    if turn_latency["audio_converted_ms"] is None:
                                        _mark("audio_converted_ms")
                                    await websocket.send_json({
                                        "event": "media",
                                        "streamSid": stream_sid,
                                        "media": {"payload": base64.b64encode(ulaw).decode("ascii")},
                                    })
                                    if turn_latency["first_twilio_audio_ms"] is None:
                                        _mark("first_twilio_audio_ms")

            twilio_task = asyncio.create_task(from_twilio())
            gemini_task = asyncio.create_task(from_gemini())
            done, pending = await asyncio.wait({twilio_task, gemini_task}, return_when=asyncio.FIRST_COMPLETED)
            for task in done:
                error = task.exception()
                if error:
                    raise error
            if not stop_received.is_set() and not transfer_required.is_set() and not routine_close_requested.is_set():
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
            vb.release_active_call_session(call_session_id)