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
import re
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

For repair or maintenance enquiries, collect one field at a time. Never ask for the caller's name, address and telephone number in the same turn.

ALLEY-GATE REPAIR RULE: If the caller reports an alley-gate repair, gate lock fault, damaged gate, or another problem with a Chapelgate alley gate, use this exact intake order:
1. Ask whether the gate is in Wirral or Sefton and wait for the answer.
2. Ask for the gate number and wait for the answer.
3. Ask what is wrong with the gate and wait for the answer.
4. Ask for the caller's full name ONLY and wait for the answer.
5. Ask for the caller's own full address including postcode ONLY and wait for the answer.
6. Ask for their callback/contact telephone number ONLY and wait for the answer.
Never combine steps 4, 5 and 6 into one question. If any answer is unclear, incomplete or sounds mistranscribed, ask for that field again before moving on.
If the caller knows the gate number, DO NOT ask for the gate's street/location because Chapelgate can identify the gate from its number. If the gate number is unknown, then ask for enough gate location information to identify it. Never invent a gate number.
PHONE PRIVACY / ACCURACY RULE: Never supply, infer, recall or guess a caller's telephone number from caller ID, records, previous calls, examples, context or memory. Only repeat a telephone number whose digits the caller has explicitly spoken during THIS call. If the digits are unclear, incomplete or implausibly short, say you did not catch the full number and ask them to repeat it. Read the number back and ask the caller to confirm it before treating it as collected.
CORRECTION RULE: If the caller says any field is wrong, immediately discard that field's previous value. Never repeat the rejected value again. Ask only for the corrected field. A new value replaces the old value only when it is clearly understood. For telephone numbers, preserve exactly the digits the caller actually supplied; never add a leading zero, remove digits, reformat into a different number, or reconstruct a number from memory. If a corrected name is rejected again, ask the caller to spell the surname letter by letter, then repeat the corrected name slowly and ask for confirmation before continuing.
ANIMAL WELFARE EMERGENCY RULE: A dog, cat, pet or other animal trapped, caught, wedged or stuck in an alley gate is an emergency. Stop the routine intake. Tell the caller not to force or operate the gate if that could worsen the entrapment or injury, tell them to contact the RSPCA or appropriate animal rescue urgently, and transfer the call to the configured Chapelgate human emergency route. If a person is also in immediate danger of serious injury, advise 999.

KEY ENQUIRY RULE: If the caller wants to order an alley-gate key, explain concisely that keys are ordered through alleygates.co.uk and that the current price is £22 including VAT and recorded delivery. Direct them to www.alleygates.co.uk for the ordering information and current details. Do not invent alternative prices, ordering routes, availability, or delivery promises. If the caller has already ordered a key, briefly confirm any order details they give you, then explain that they should have received a confirmation email containing their order or reference number. For an order-specific update, tell them to reply to that confirmation email. Keys are sent by Royal Mail, and tracking information is emailed when the order is dispatched. Do not claim live access to orders or promise an exact delivery date.
If the caller wants to order or pay by phone, cannot use the website, or asks for a person about a routine key matter, DO NOT offer a transfer, cash, bank transfer, or another telephone ordering route. Explain that routine key ordering is through alleygates.co.uk. If they need further non-emergency help, direct them to the website contact route.

MASTER KEY RULE: Master keys are restricted and are not ordinary resident keys. Do not say they can be ordered through the resident-key website. Anyone wishing to apply for a master key must email info@alleygates.co.uk from an official organisation or work email address, explaining why the master key is required and providing their full name, role/organisation, postal address, contact number, area/site, and any relevant gate or reference details. This is an application only; approval is not guaranteed. Do not disclose master-key security details or promise eligibility or approval.

REPAIR TIMESCALE RULE: If a caller asks how long a repair will take, say someone will be able to look at it within 24 to 48 hours. Explain that if parts are needed, such as a new cylinder, completion can take anywhere from two to four weeks because Chapelgate is currently experiencing long lead times. Do not promise completion within 24 to 48 hours; that is the timeframe for someone to look at the repair.

A job reference will be supplied to you in the live-call context. For every repair/maintenance intake, before ending you MUST read back ALL collected job details: Wirral/Sefton area, gate number (or gate location if the number is unknown), exact fault/problem, caller name, callback/contact number, full caller address including postcode, and the job reference. Then explicitly ask: 'Is all of that correct?' Only treat a clear affirmative answer such as 'yes', 'correct', 'that's right' or equivalent clear English confirmation as confirmation. Never say 'Thank you for confirming' unless the immediately preceding caller response is a clear affirmative confirmation. Unclear speech, background noise, an unrelated phrase, another language, or an answer you cannot confidently understand is NOT confirmation: ask again. If the caller corrects anything, update it and read back the corrected details again before asking for confirmation.
CALL CLOSING RULE: Do not end a repair call until the full read-back has received a clear confirmation. After confirmation, ask whether there is anything else. Only if the caller clearly says no, no thanks, that's all, or equivalent should you say: 'Thank you for calling Chapel Gate. Goodbye, have a nice day.' If the caller's response is unclear, do not assume they are finished; ask them to repeat it.
Never end a completed routine call in silence.
Do not claim a contractor has been booked or dispatched unless the backend explicitly confirms it.
Never invent bookings, contractor dispatches, notifications, refunds, compensation, private account information, or safety assurances. If you do not know, say so.
Routine maintenance words are not automatically emergencies. Only advise 999 for a credible immediate threat to life or serious injury. Never say 911.
Do not proactively offer a human. Transfer to the configured human number ONLY for a genuine emergency requiring immediate Chapelgate attention. A routine request for a person or manager, a key order, payment by phone, inability to use the website, an order update, or an ordinary repair is NOT a transfer reason. For non-emergency human contact, direct the caller to the website contact route.
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


def _emergency_transfer_requested(text: str) -> bool:
    lowered = (text or "").casefold().replace("’", "'").replace("‘", "'")
    if any(phrase in lowered for phrase in (
        "not an emergency",
        "isn't an emergency",
        "is not an emergency",
        "no emergency",
    )):
        return False
    explicit = (
        "it's an emergency",
        "it is an emergency",
        "this is an emergency",
        "genuine emergency",
        "immediate danger",
        "gate is falling",
        "gate's falling",
        "gate has fallen",
        "gate's fallen",
        "gate is hanging",
        "gate's hanging",
        "about to fall",
        "trapped by the gate",
        "trapped behind the gate",
    )
    return any(phrase in lowered for phrase in explicit)


def _animal_welfare_emergency(text: str) -> bool:
    lowered = (text or "").casefold()
    animal = re.search(r"\b(dog|cat|pet|animal)\b", lowered)
    trapped = re.search(r"\b(stuck|trapped|caught|wedged)\b", lowered)
    gate = re.search(r"\bgate\b", lowered)
    return bool(animal and trapped and gate)


def _valid_uk_callback_digits(digits: str) -> bool:
    digits = re.sub(r"\D", "", digits or "")
    if digits.startswith("07"):
        return len(digits) == 11
    if digits.startswith("0"):
        return len(digits) in {10, 11}
    return digits.startswith("44") and len(digits) == 12


def _extract_trusted_callback_digits(text: str) -> str:
    text = text or ""
    for match in re.finditer(r"\+?\d[\d\s()-]{7,}\d", text):
        digits = re.sub(r"\D", "", match.group(0))
        if _valid_uk_callback_digits(digits):
            return digits

    number_words = {
        "zero": "0", "oh": "0", "one": "1", "two": "2", "three": "3",
        "four": "4", "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
    }
    tokens = re.findall(r"[a-z]+|\d+", text.casefold())
    out: list[str] = []
    repeat = 1
    saw_number_word = False
    for token in tokens:
        if token in {"double"}:
            repeat = 2
            continue
        if token in {"treble", "triple"}:
            repeat = 3
            continue
        if token in number_words:
            out.extend([number_words[token]] * repeat)
            repeat = 1
            saw_number_word = True
            continue
        if token.isdigit():
            out.extend(list(token) * repeat)
            repeat = 1
            saw_number_word = True
            continue
        repeat = 1
    digits = "".join(out)
    return digits if saw_number_word and _valid_uk_callback_digits(digits) else ""


def _extract_clear_name(text: str) -> str:
    text = (text or "").strip(" ,.")
    explicit = re.search(
        r"\bmy\s+name\s+is\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,3})\b",
        text,
    )
    if explicit:
        return explicit.group(1).strip()
    if re.fullmatch(r"[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,3}", text):
        return text

    tokens = re.findall(r"[A-Za-z]+", text)
    if len(tokens) >= 4 and len(tokens[0]) > 1 and all(len(token) == 1 for token in tokens[1:]):
        surname = "".join(tokens[1:]).capitalize()
        return f"{tokens[0].capitalize()} {surname}"
    return ""


def _caller_rejects_phone(text: str) -> bool:
    return bool(re.search(
        r"(?:\b(?:telephone|phone|contact)\b.{0,35}\b(?:wrong|incorrect)\b|\b(?:wrong|incorrect)\b.{0,35}\b(?:telephone|phone|contact)\b|\byou\s+got\s+(?:my\s+)?(?:telephone|phone|contact).*wrong\b)",
        text or "",
        re.IGNORECASE,
    ))


def _caller_rejects_name(text: str) -> bool:
    return bool(re.search(
        r"(?:\bname\b.{0,30}\b(?:wrong|incorrect)\b|\b(?:wrong|incorrect)\b.{0,30}\bname\b|\byou\s+got\s+my\s+name\s+wrong\b)",
        text or "",
        re.IGNORECASE,
    ))


def _caller_reports_correction(text: str) -> bool:
    return bool(re.search(r"\b(wrong|incorrect|correcting|correction|needs?\s+correcting)\b", text or "", re.IGNORECASE))


def _assistant_requested_field(text: str) -> str | None:
    lowered = (text or "").casefold()
    if any(p in lowered for p in ("is all of that correct", "is everything correct", "is everything else correct", "is that correct")):
        return "confirmation"
    if any(p in lowered for p in ("telephone number", "contact number", "phone number")) and any(
        p in lowered for p in ("could you", "can you", "please", "what's", "what is", "repeat", "provide", "correct")
    ):
        return "phone"
    if "name" in lowered and any(p in lowered for p in ("could you", "can you", "please", "what's", "what is", "full name", "correct name")):
        return "name"
    if any(p in lowered for p in ("address", "postcode")) and any(p in lowered for p in ("could you", "can you", "please", "give me", "provide")):
        return "address"
    if "gate number" in lowered and any(p in lowered for p in ("could you", "can you", "do you", "what's", "what is", "correct")):
        return "gate"
    if any(p in lowered for p in ("what's wrong with the gate", "what is wrong with the gate", "problem with the gate")):
        return "fault"
    return None


def _assistant_phone_readback(text: str) -> str:
    match = re.search(
        r"\b(?:telephone|phone|contact)\s+number(?:\s+is|'s)?\s+(\+?\d[\d\s()-]{7,}\d)",
        text or "",
        re.IGNORECASE,
    )
    return re.sub(r"\D", "", match.group(1)) if match else ""


def _assistant_name_readback(text: str) -> str:
    match = re.search(
        r"\byour\s+name(?:\s+is|'s)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,3})",
        text or "",
    )
    return match.group(1).strip() if match else ""


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
            awaiting_field: str | None = None
            correction_waiting = False
            correction_generation = 0
            correction_started_at = time.monotonic()
            last_caller_transcription_at = time.monotonic()
            trusted_phone = ""
            trusted_name = ""
            animal_emergency_pending = False
            name_correction_count = 0
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

            async def correction_watchdog() -> None:
                last_reprompted_generation = -1
                while not stop_received.is_set() and not transfer_required.is_set() and not routine_close_requested.is_set():
                    await asyncio.sleep(1.0)
                    if not correction_waiting or correction_generation == last_reprompted_generation:
                        continue
                    quiet_for = time.monotonic() - max(correction_started_at, last_caller_transcription_at)
                    if quiet_for < 7.0:
                        continue
                    last_reprompted_generation = correction_generation
                    field = awaiting_field or "outstanding detail"
                    operational_event(
                        "voice_correction_watchdog",
                        transport="gemini",
                        outcome="reprompt",
                        reason_code=field,
                    )
                    with suppress(Exception):
                        await session.send_realtime_input(
                            text=(
                                f"INTERNAL REPROMPT: The caller has not been successfully understood for {field}. "
                                "Do not stay silent. Ask again now for that one field only, slowly and clearly. "
                                "Do not invent or repeat an unverified value."
                            )
                        )

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
                nonlocal closing_prompt_seen, awaiting_field, correction_waiting
                nonlocal correction_generation, correction_started_at, last_caller_transcription_at
                nonlocal trusted_phone, trusted_name, animal_emergency_pending, name_correction_count
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
                            last_caller_transcription_at = time.monotonic()
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

                                    if _animal_welfare_emergency(merged):
                                        animal_emergency_pending = True
                                        correction_waiting = False
                                        awaiting_field = None
                                        await session.send_realtime_input(
                                            text=(
                                                "INTERNAL EMERGENCY: The caller has reported an animal trapped in the gate. "
                                                "Tell them this is an animal-welfare emergency, advise them to contact the RSPCA "
                                                "or appropriate animal rescue urgently, and tell them you are transferring them "
                                                "to Chapelgate now. Do not continue routine intake."
                                            )
                                        )
                                    elif _caller_rejects_phone(merged):
                                        trusted_phone = ""
                                        awaiting_field = "phone"
                                        correction_waiting = True
                                        correction_generation += 1
                                        correction_started_at = time.monotonic()
                                        await session.send_realtime_input(
                                            text=(
                                                "INTERNAL FIELD STATE: The caller says the telephone/contact number is wrong. "
                                                "Discard every previous phone number. Do not say any phone digits. "
                                                "Ask for the full correct telephone number slowly, digit by digit."
                                            )
                                        )
                                    elif _caller_rejects_name(merged):
                                        trusted_name = ""
                                        name_correction_count += 1
                                        awaiting_field = "name"
                                        correction_waiting = True
                                        correction_generation += 1
                                        correction_started_at = time.monotonic()
                                        if name_correction_count >= 2:
                                            instruction = (
                                                "INTERNAL FIELD STATE: The caller has rejected the name again. "
                                                "Discard every previous name. Ask for the correct full name and ask them "
                                                "to spell the surname letter by letter. Do not repeat an old or guessed name."
                                            )
                                        else:
                                            instruction = (
                                                "INTERNAL FIELD STATE: The caller says the name is wrong. "
                                                "Discard the previous name. Ask for the correct full name only. "
                                                "Do not repeat an old or guessed name."
                                            )
                                        await session.send_realtime_input(text=instruction)
                                    elif awaiting_field == "phone":
                                        candidate = _extract_trusted_callback_digits(merged)
                                        if candidate:
                                            trusted_phone = candidate
                                            awaiting_field = None
                                            correction_waiting = False
                                            await session.send_realtime_input(
                                                text=(
                                                    "INTERNAL VERIFIED FIELD: The caller explicitly supplied callback digits "
                                                    + " ".join(candidate)
                                                    + ". If you read the number back, use exactly these digits in this order. "
                                                      "Do not add, remove, infer or substitute any digit."
                                                )
                                            )
                                        else:
                                            correction_waiting = True
                                            correction_generation += 1
                                            correction_started_at = time.monotonic()
                                            await session.send_realtime_input(
                                                text=(
                                                    "INTERNAL FIELD VALIDATION: No complete valid UK callback number was captured. "
                                                    "Do not say any telephone number. Ask the caller to repeat the full number slowly, digit by digit."
                                                )
                                            )
                                    elif awaiting_field == "name":
                                        candidate_name = _extract_clear_name(merged)
                                        if candidate_name:
                                            trusted_name = candidate_name
                                            awaiting_field = None
                                            correction_waiting = False
                                            await session.send_realtime_input(
                                                text=(
                                                    f"INTERNAL VERIFIED FIELD: The caller's latest clearly supplied full name is "
                                                    f"{candidate_name}. Use that exact name and do not revert to an earlier name."
                                                )
                                            )
                                        else:
                                            correction_waiting = True
                                            correction_generation += 1
                                            correction_started_at = time.monotonic()
                                            await session.send_realtime_input(
                                                text=(
                                                    "INTERNAL FIELD VALIDATION: The name was not clearly captured. "
                                                    "Do not guess a name. Ask again for the caller's full name only."
                                                )
                                            )
                                    elif awaiting_field == "confirmation":
                                        if _caller_reports_correction(merged):
                                            correction_waiting = True
                                            correction_generation += 1
                                            correction_started_at = time.monotonic()
                                            await session.send_realtime_input(
                                                text=(
                                                    "INTERNAL CORRECTION: The caller has rejected the read-back. "
                                                    "Ask which single field is wrong, then correct one field at a time. "
                                                    "Do not treat this as confirmation."
                                                )
                                            )
                                        elif not _routine_close_confirmed(merged):
                                            correction_waiting = True
                                    elif awaiting_field:
                                        awaiting_field = None
                                        correction_waiting = False

                                should_close = (
                                    not correction_waiting
                                    and (
                                        (closing_prompt_seen and _routine_close_confirmed(merged))
                                        or _farewell_only(merged)
                                    )
                                )
                                if should_close:
                                    await request_routine_close()
                                    return
                            if _emergency_transfer_requested(text):
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
                                    attempted_phone = _assistant_phone_readback(merged)
                                    attempted_name = _assistant_name_readback(merged)
                                    unsafe_readback = False
                                    if attempted_phone and (not trusted_phone or attempted_phone != trusted_phone):
                                        unsafe_readback = True
                                        awaiting_field = "phone"
                                        correction_waiting = True
                                        correction_generation += 1
                                        correction_started_at = time.monotonic()
                                        with suppress(Exception):
                                            await websocket.send_json({"event": "clear", "streamSid": stream_sid})
                                        await session.send_realtime_input(
                                            text=(
                                                "INTERNAL SAFETY CORRECTION: You attempted to say telephone digits that were not "
                                                "verified from the caller's latest explicit number. Stop. Do not repeat those digits. "
                                                "Ask the caller for the full telephone number slowly, digit by digit."
                                            )
                                        )
                                    if attempted_name and (not trusted_name or attempted_name.casefold() != trusted_name.casefold()):
                                        unsafe_readback = True
                                        awaiting_field = "name"
                                        correction_waiting = True
                                        correction_generation += 1
                                        correction_started_at = time.monotonic()
                                        with suppress(Exception):
                                            await websocket.send_json({"event": "clear", "streamSid": stream_sid})
                                        await session.send_realtime_input(
                                            text=(
                                                "INTERNAL SAFETY CORRECTION: You attempted to say an unverified or outdated caller name. "
                                                "Do not repeat it. Ask the caller for their correct full name only."
                                            )
                                        )
                                    field = _assistant_requested_field(merged)
                                    if field:
                                        awaiting_field = field
                                        correction_waiting = True
                                        correction_generation += 1
                                        correction_started_at = time.monotonic()
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
                        if getattr(content, "turn_complete", False) and animal_emergency_pending:
                            animal_emergency_pending = False
                            await request_human_transfer()
                            return

            twilio_task = asyncio.create_task(from_twilio())
            gemini_task = asyncio.create_task(from_gemini())
            watchdog_task = asyncio.create_task(correction_watchdog())
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
            watchdog_task.cancel()
            await asyncio.gather(*pending, return_exceptions=True)
            await asyncio.gather(watchdog_task, return_exceptions=True)
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