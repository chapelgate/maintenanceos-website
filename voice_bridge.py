"""Fail-closed bridge between Twilio Media Streams and OpenAI Realtime."""

import asyncio
import base64
import hashlib
import json
import os
import re
import threading
import time
from contextlib import suppress
from datetime import datetime
from clock import utcnow
from html import escape
from urllib.parse import quote

import websockets
from fastapi import WebSocket
from websockets.exceptions import ConnectionClosed

from channels import create_from_channel, resident_by_phone
from decision_engine import classify
from identity import normalise_postcode
from models import AuditEvent, CallEvent, CallSession, Escalation, Property, Resident, SessionLocal, UnmatchedInbound
from security import app_secret_ready, sign_link, verify_link
from idempotency import claim_action
from ingress_security import websocket_event_within_limit,websocket_rate_allowed
from operational_logging import operational_event
from tenant_security import bind_call_to_tenant,call_client_id,configured_voice_client_id,isolated_voice_tenant_ready
from voice_policy import authorize_model_action,validate_assistant_text,verified_actions_for_work_order
from webhook_security import dedicated_test_number_ready,public_provider_ingress_ready,validate_twilio_websocket
from call_capacity import release_call_lease


SYSTEM_PROMPT = """You are Chapelgate's telephone receptionist for the Alleygates service in the UK.
Speak natural conversational British English: warm, concise, professional, and human-sounding.
Start every call with exactly: Hi, thank you for calling Chapel Gate. How can we help you today?
Listen fully before replying. Treat interruptions as normal conversation: stop speaking immediately when the caller starts, listen to the new point, and respond to what they just said rather than finishing the previous script. Use natural acknowledgements sparingly and vary them; do not sound like a menu or checklist. Ask one useful question at a time. Keep replies short and responsive.
Normally use one short sentence per turn, and no more than two short sentences unless a required process genuinely needs it.
Do not leave long silent pauses. When you need a moment, use a brief natural acknowledgement such as "Okay" or "Thanks".
Never proactively mention the Chapelgate team, a team member, human operator, Chapelgate as a handoff destination, transfer, referral, escalation, passing something to the team, or putting the caller through. Do not say "contact the Chapelgate team", "refer this to Chapelgate", "pass this to the team", or similar. Routine repairs, uncertainty, topic changes, and awkward conversation are NOT reasons to transfer or refer. Only transfer if the caller explicitly asks to speak to a person, or there is a genuine gate emergency requiring immediate Chapelgate attention.

ALLEY-GATE REPAIR INTAKE — follow this order:
1. After the caller explains that it is a gate repair/fault, first take their full name, their own address, and their callback/contact number.
2. Ask whether the gate is in Wirral or Sefton.
3. Ask: "Do you know the gate number?"
4. Ask what is wrong with the gate and enough detail to make the job actionable.
Never ask for the postcode of an alley gate. If the caller knows the gate number, do not ask for the gate street/location/postcode because Chapelgate can identify it from the number. If the gate number is unknown, ask for enough location information to identify the gate. Never invent a gate number.
For a routine alley-gate repair, do not require postcode identity verification before taking the report.

GATE EMERGENCY RULE:
A caller describing a gate problem as urgent/emergency must be handed to the Chapelgate human number rather than being told to call 999 merely because a gate is broken, jammed, insecure, locked, or blocking access.
Only mention 999 when the caller describes a credible immediate threat to life or serious injury, such as an active fire, serious medical emergency, or other genuine life-threatening situation. Never tell a UK caller to call 911.
If the gate situation itself needs immediate Chapelgate attention, say briefly that you will put them through and allow the deterministic transfer path to handle it.

RESIDENT KEY RULE:
If the caller asks for "a key", "an alley-gate key", "a resident key", "a replacement key", or otherwise does not explicitly say "master key", treat it as an ordinary resident key enquiry.
Tell them ordinary resident keys are ordered at www.alleygates.co.uk. The current price is £22 including VAT and recorded delivery. Tell them they will need the gate number when ordering online.
Do not tell them to get the key from a landlord, housing association, housing provider, council, or another third party.
If they cannot use the website or cannot pay online, tell them to email info@alleygates.co.uk so another payment method such as cash or bank transfer can be arranged. Do not offer to transfer the call unless the caller explicitly asks for a person.
Once an ordinary resident-key enquiry has started, keep that as the active topic for natural follow-up questions. Short follow-ups such as "how much is it?", "does that include delivery?", "where do I order it?", "what do I need?", "can I pay another way?", "what if I can't use the website?", or "how long does it take?" refer to the resident key unless the caller clearly changes subject or explicitly asks for a master key. Answer only the question asked; do not repeat the full ordering script on every turn. If the caller clearly changes topic, acknowledge the change naturally in one short sentence and immediately handle the new topic; do not finish or restart the old script.
For resident-key follow-ups: the known facts are www.alleygates.co.uk; £22 including VAT and recorded delivery; the caller needs the gate number to order online; and, if online ordering/payment cannot be used, info@alleygates.co.uk can arrange another payment method such as cash or bank transfer. Never mention "live orders", access to orders, order tracking, an order system, or whether you can see orders unless a separate future feature explicitly adds that capability. Those concepts are not part of this resident-key call flow. If asked for a fact not supplied here (for example a delivery timescale), simply say you do not have that information and continue naturally rather than guessing or talking about systems you cannot access.

MASTER KEY RULE:
Never mention master-key details unless the caller explicitly asks for a master key or clearly states that they need a restricted organisational master key.
Master keys are restricted and are not ordinary resident keys. An applicant must email info@alleygates.co.uk from an official organisation/work email, explaining why it is required and supplying their full name, role/organisation, postal address, contact number, area/site, and relevant gate/reference details. Approval is not guaranteed.
Do not volunteer this information during an ordinary key enquiry.

REPAIR TIMESCALE RULE:
If asked how long a repair will take, say someone will be able to look at it within 24 to 48 hours. If parts are needed, such as a new cylinder, completion can take two to four weeks because of current lead times. Do not promise completion within 24 to 48 hours.

For repair/maintenance calls, before ending, briefly read back the important details you collected.
Never invent bookings, contractor dispatches, notifications, refunds, compensation, private account information, or safety assurances. If you do not know, say so.
Caller ID is not proof of identity. Do not disclose private resident/property/account information to an unverified caller.
Do not proactively offer a human or a transfer. Transfer only when the caller explicitly asks for a person, or when a genuine gate emergency requires immediate Chapelgate attention. Being unsure, changing topic, or handling a routine repair must never trigger or suggest a transfer; if information is unknown, say so briefly and continue the call.
The backend deterministic safety engine has final authority. It remains authoritative for downstream actions."""

ESCALATION_TERMS = [
    "human",
    "person",
    "manager",
    "complaint",
    "compensation",
    "refund",
    "legal",
    "solicitor",
    "lawyer",
    "court",
    "threat",
    "threatening",
    "safeguarding",
    "vulnerable",
    "harassment",
    "abuse",
    "dangerous",
]

_ACTIVE_CALL_SESSIONS = set()
_ACTIVE_CALL_LOCK = threading.Lock()


def claim_active_call_session(call_session_id: int) -> bool:
    """Atomically claim an in-process media/AI session slot for this call_session_id."""
    if not call_session_id:
        return False
    with _ACTIVE_CALL_LOCK:
        if call_session_id in _ACTIVE_CALL_SESSIONS:
            return False
        _ACTIVE_CALL_SESSIONS.add(call_session_id)
        return True


def release_active_call_session(call_session_id: int | None) -> None:
    if not call_session_id:
        return
    with _ACTIVE_CALL_LOCK:
        _ACTIVE_CALL_SESSIONS.discard(call_session_id)


def active_call_session_count() -> int:
    with _ACTIVE_CALL_LOCK:
        return len(_ACTIVE_CALL_SESSIONS)


UNVERIFIED_ACTION_FALLBACK = (
    "The automated response could not be verified. Do not assume that a contractor, "
    "emergency service, human operator, or other person has been contacted. If there is "
    "immediate danger, call 999 now. Please hold while I transfer you."
)
SUPPORTED_REALTIME_MODELS = {
    "gpt-realtime-2.1",
    "gpt-realtime-2",
    "gpt-realtime-1.5",
}
SUPPORTED_REALTIME_VOICES = {
    "alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse", "marin", "cedar",
}
UK_POSTCODE = re.compile(r"\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b", re.IGNORECASE)
MAX_IDENTITY_ATTEMPTS = 3
MAX_TRANSCRIPT_CHARS = 20_000
MAX_MEDIA_PAYLOAD_BYTES = 64 * 1024
MAX_BUFFERED_AUDIO_BYTES = 8 * 1024 * 1024
MAX_SEQUENCE_KEYS = 100_000


class VoiceProtocolError(RuntimeError):
    pass


def realtime_enabled() -> bool:
    return os.getenv("ENABLE_REALTIME_VOICE", "false").lower() == "true"


def twilio_tts_voice() -> str:
    value = os.getenv("TWILIO_TTS_VOICE", "Polly.Amy").strip()
    return value if re.fullmatch(r"[A-Za-z0-9.-]+", value) else "Polly.Amy"


def twilio_tts_language() -> str:
    value = os.getenv("TWILIO_TTS_LANGUAGE", "en-GB").strip()
    return value if re.fullmatch(r"[A-Za-z]{2}-[A-Za-z]{2}", value) else "en-GB"


def realtime_model_supported() -> bool:
    return os.getenv("OPENAI_REALTIME_MODEL", "") in SUPPORTED_REALTIME_MODELS


def transcription_model_supported() -> bool:
    return os.getenv("OPENAI_TRANSCRIPTION_MODEL", "") == "gpt-live-transcribe"


def realtime_voice_supported() -> bool:
    return os.getenv("OPENAI_REALTIME_VOICE", "") in SUPPORTED_REALTIME_VOICES


def public_stream_url() -> str:
    base = os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")
    if not base.startswith("https://"):
        return ""
    return base.replace("https://", "wss://", 1) + "/voice/media-stream"


def public_stream_status_url() -> str:
    base = os.getenv("PUBLIC_BASE_URL", "").strip().rstrip("/")
    return base + "/voice/stream-status" if base.startswith("https://") else ""


def voice_ready() -> bool:
    return bool(
        realtime_enabled()
        and public_provider_ingress_ready()
        and public_stream_url()
        and os.getenv("OPENAI_API_KEY")
        and realtime_model_supported()
        and transcription_model_supported()
        and realtime_voice_supported()
        and os.getenv("TWILIO_ACCOUNT_SID")
        and os.getenv("TWILIO_AUTH_TOKEN")
        and dedicated_test_number_ready()
        and os.getenv("VERIFY_TWILIO_SIGNATURES", "false").lower() == "true"
        and app_secret_ready()
        and isolated_voice_tenant_ready(lambda: SessionLocal())
    )


def inbound_fallback_twiml(message: str, transfer_number: str = "") -> str:
    voice = escape(twilio_tts_voice())
    language = escape(twilio_tts_language())
    dial = ""
    if transfer_number:
        dial = (
            f'<Say language="{language}" voice="{voice}">Please hold while I transfer you.</Say>'
            f'<Dial>{escape(transfer_number)}</Dial>'
        )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        f'<Say language="{language}" voice="{voice}">{escape(message)}</Say>'
        f"{dial}"
        "</Response>"
    )


def _stream_token(call_session_id: int, call_sid: str) -> str:
    return sign_link("voice_stream", call_session_id, call_sid)


def inbound_stream_twiml(call_session_id: int, call_sid: str) -> str:
    stream_url = public_stream_url()
    status_url = public_stream_status_url()
    voice = escape(twilio_tts_voice())
    language = escape(twilio_tts_language())
    token = _stream_token(call_session_id, call_sid)
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        "<Connect>"
        f'<Stream url="{escape(stream_url)}" statusCallback="{escape(status_url)}" statusCallbackMethod="POST">'
        f'<Parameter name="call_session_id" value="{call_session_id}" />'
        f'<Parameter name="call_sid" value="{escape(call_sid)}" />'
        f'<Parameter name="stream_token" value="{escape(token)}" />'
        "</Stream>"
        "</Connect>"
        "</Response>"
    )


def _request_live_human_transfer(call_sid: str) -> bool:
    transfer_number = os.getenv("TWILIO_HUMAN_TRANSFER_NUMBER", "").strip()
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    if not call_sid or not transfer_number or not account_sid or not auth_token:
        return False
    from twilio.rest import Client as TwilioClient
    # Keep transfer audio single-voice: the AI decides whether to announce the
    # handoff. Twilio itself must not inject a second TTS voice mid-call.
    twiml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Response>'
        f'<Dial>{escape(transfer_number)}</Dial>'
        '</Response>'
    )
    TwilioClient(account_sid, auth_token).calls(call_sid).update(twiml=twiml)
    return True


def create_call_session(call_sid: str, caller: str, client_id: int) -> int:
    phone = caller.replace("whatsapp:", "")
    resident_id = resident_by_phone(phone, client_id) if phone else None
    stored_caller = "sha256:" + hashlib.sha256(phone.encode()).hexdigest() if phone else ""
    with SessionLocal() as s:
        existing = s.query(CallSession).filter_by(call_sid=call_sid).first()
        if existing:
            bind_call_to_tenant(s,existing.id,client_id)
            s.commit()
            return existing.id
        cs = CallSession(call_sid=call_sid, caller=stored_caller, resident_id=resident_id)
        s.add(cs);s.flush();bind_call_to_tenant(s,cs.id,client_id)
        try:
            s.commit()
        except Exception:
            s.rollback()
            existing = s.query(CallSession).filter_by(call_sid=call_sid).first()
            if existing:
                # Must re-check tenant binding — never return a foreign session id.
                bind_call_to_tenant(s, existing.id, client_id)
                s.commit()
                return existing.id
            raise
        return cs.id


def _explicit_human_request(text: str) -> bool:
    lowered = (text or "").casefold()
    return any(phrase in lowered for phrase in (
        "speak to a person", "speak to someone", "speak to a human",
        "speak to the manager", "talk to a person", "talk to someone",
        "put me through", "transfer me", "get me a person",
    ))


def requires_immediate_human_escalation(text: str) -> tuple[bool, str, list]:
    lowered = text.lower() if isinstance(text, str) else ""
    # Alleygate-specific operational emergencies go to Chapelgate directly.
    # Do this before generic maintenance classification so phrases such as
    # "gate emergency" do not get treated as a reason to tell the caller to ring 999.
    gate_context = any(term in lowered for term in ("gate", "alley gate", "alleygate"))
    gate_urgent = any(term in lowered for term in (
        "emergency", "urgent", "urgently", "need someone now", "immediate",
        "can't get through", "cannot get through", "can't get out", "cannot get out",
        "locked in", "locked out", "stuck shut", "jammed shut",
    ))
    if gate_context and gate_urgent:
        return True, "gate_emergency_handoff", []
    result = classify(text)
    if result["safety_flags"]:
        return True, "deterministic_safety", result["safety_flags"]
    # Generic human-review/escalation classifications are internal workflow
    # signals, not permission to transfer a live caller. Live voice handoff is
    # deliberately narrower: explicit caller request or genuine gate emergency.
    return False, "", []


def requires_human_escalation(text: str) -> tuple[bool, str]:
    escalate, reason, flags = requires_immediate_human_escalation(text)
    if escalate:
        return True, json.dumps(flags) if flags else reason
    if classify(text)["human_review_required"]:
        return True, "low_confidence_or_unknown_category"
    return False, ""


def _summary_state(cs: CallSession) -> dict:
    try:
        state = json.loads(cs.summary or "{}")
        return state if isinstance(state, dict) else {}
    except json.JSONDecodeError:
        return {"status": cs.summary} if cs.summary else {}


def _save_summary_state(cs: CallSession, state: dict) -> None:
    cs.summary = json.dumps(state, sort_keys=True)


def _maybe_verify_postcode(s, cs: CallSession, text: str) -> None:
    if not cs.resident_id or cs.verification_status in {"POSTCODE_VERIFIED", "IDENTITY_LOCKED"}:
        return
    resident = s.query(Resident).filter_by(id=cs.resident_id).first()
    client_id=call_client_id(s,cs.id)
    if not resident or resident.client_id!=client_id:return
    prop=s.query(Property).filter_by(id=resident.property_id,client_id=client_id).first()
    candidates = UK_POSTCODE.findall(text if isinstance(text, str) else "")
    if not candidates:
        return
    expected = normalise_postcode(prop.postcode) if prop else ""
    if expected and any(normalise_postcode(candidate) == expected for candidate in candidates):
        cs.verification_status = "POSTCODE_VERIFIED"
        _record_call_event(s, cs, "CALLER_POSTCODE_VERIFIED", cs.call_sid, "postcode-verified")
        return
    state = _summary_state(cs)
    attempts = min(int(state.get("identity_attempts", 0)) + 1, MAX_IDENTITY_ATTEMPTS)
    state["identity_attempts"] = attempts
    _save_summary_state(cs, state)
    _record_call_event(s, cs, "CALLER_POSTCODE_REJECTED", str(attempts), f"postcode-rejected:{attempts}")
    if attempts >= MAX_IDENTITY_ATTEMPTS:
        cs.verification_status = "IDENTITY_LOCKED"
        _persist_escalation(s, cs, "identity_verification_locked", [], "")


def _voice_disclosure_context(s, cs: CallSession | None) -> tuple[bool, list[str]]:
    if not cs:
        return False, []
    verified = cs.verification_status == "POSTCODE_VERIFIED"
    if not cs.resident_id:
        return verified, []
    try:
        client_id = call_client_id(s, cs.id)
    except Exception:
        return False, []
    resident = s.query(Resident).filter_by(id=cs.resident_id, client_id=client_id, active=True).first()
    if not resident:
        return False, []
    prop = s.query(Property).filter_by(id=resident.property_id, client_id=client_id).first()
    markers = [resident.name, resident.email, resident.phone]
    if prop:
        markers.extend([prop.address, prop.postcode, prop.access_notes, prop.emergency_notes])
    return verified, [value for value in markers if value]


def _record_call_event(s, cs: CallSession, event: str, detail: str, event_key: str) -> None:
    client_id = call_client_id(s, cs.id)
    key = hashlib.sha256(f"{event}:{event_key}".encode()).hexdigest()
    existing = s.query(CallEvent).filter_by(call_session_id=cs.id, event_key=key).first()
    if not existing:
        s.add(CallEvent(
            call_session_id=cs.id,
            client_id=client_id,
            event_key=key,
            event=event,
            detail=detail,
        ))


def _persist_escalation(s, cs: CallSession, reason: str, flags: list, fragment: str = "") -> bool:
    state = _summary_state(cs)
    known_codes = {item.get("code") for item in state.get("safety_flags", []) if isinstance(item, dict)}
    new_flags = [item for item in flags if item.get("code") not in known_codes]
    reasons = state.setdefault("reasons", [])
    new_reason = reason and reason not in reasons
    if not new_flags and not new_reason:
        return True

    if new_flags:
        state.setdefault("safety_flags", []).extend(new_flags)
    if new_reason:
        reasons.append(reason)
    state["status"] = "HUMAN_ESCALATION_REQUIRED"
    _save_summary_state(cs, state)

    if new_flags and fragment:
        partial_line = f"Caller [safety partial]: {fragment.strip()}"
        if partial_line not in cs.transcript:
            cs.transcript = (cs.transcript + "\n" + partial_line).strip()

    level = "RED" if new_flags and any(item.get("level") == "RED" for item in new_flags) else "AMBER"
    payload = {
        "call_session_id": cs.id,
        "call_sid": cs.call_sid,
        "reason": reason,
        "flags": new_flags,
        "fragment": fragment,
    }
    detail = json.dumps(payload)
    _record_call_event(s, cs, "VOICE_ESCALATION_REQUIRED", detail, f"{reason}:{','.join(sorted(known_codes))}")
    if cs.work_order_id:
        s.add(Escalation(work_order_id=cs.work_order_id, level=level, reason=detail))
        s.add(AuditEvent(work_order_id=cs.work_order_id, actor="Voice Safety Gate", event="VOICE_ESCALATION_REQUIRED", detail=detail))
    return True


def record_safety_observation(call_session_id: int, text: str) -> bool:
    clean = text.strip() if isinstance(text, str) else ""
    if not clean:
        return False
    escalate, reason, flags = requires_immediate_human_escalation(clean)
    if not escalate:
        return False
    with SessionLocal() as s:
        cs = s.query(CallSession).filter_by(id=call_session_id).first()
        if not cs:
            return True
        _persist_escalation(s, cs, reason, flags, clean)
        s.commit()
    return True


def record_transcript_segment(call_session_id: int, speaker: str, text: str) -> bool:
    clean = text.strip() if isinstance(text, str) else ""
    if not clean:
        return False
    with SessionLocal() as s:
        cs = s.query(CallSession).filter_by(id=call_session_id).first()
        if not cs:
            return False
        safe_speaker = speaker if isinstance(speaker, str) else "Unknown"
        line = f"{safe_speaker}: {clean}"
        if line not in cs.transcript.splitlines():
            cs.transcript = (cs.transcript + "\n" + line).strip()
        if safe_speaker.lower() == "caller":
            _maybe_verify_postcode(s, cs, clean)
            escalate, reason, flags = requires_immediate_human_escalation(clean)
            if escalate:
                _persist_escalation(s, cs, reason, flags, clean)
        else:
            escalate = False
        s.commit()
        return escalate


def record_call_interruption(call_session_id: int, reason: str) -> None:
    with SessionLocal() as s:
        cs = s.query(CallSession).filter_by(id=call_session_id).first()
        if not cs:
            return
        _persist_escalation(s, cs, reason, [], "")
        s.commit()


def close_call_session(call_session_id: int) -> None:
    with SessionLocal() as s:
        cs = s.query(CallSession).filter_by(id=call_session_id).first()
        if not cs:
            return
        if not cs.ended_at:
            client_id=call_client_id(s,cs.id)
            transcript = cs.transcript.strip()
            if transcript and not cs.resident_id and not cs.work_order_id:
                _, fresh = claim_action(
                    s,
                    "VOICE_UNMATCHED_REPORT",
                    cs.call_sid,
                    client_id=client_id,
                )
                if fresh:
                    s.add(UnmatchedInbound(
                        client_id=client_id,
                        channel="VOICE",
                        participant_hash=cs.caller.removeprefix("sha256:"),
                        body=transcript,
                    ))
                    _record_call_event(s, cs, "UNMATCHED_VOICE_REPORT_RECORDED", "human review required", cs.call_sid)
            elif transcript and cs.resident_id and not cs.work_order_id:
                resident = s.query(Resident).filter_by(id=cs.resident_id).first()
                if resident and resident.client_id==client_id:
                    cs.work_order_id = create_from_channel(
                        client_id,
                        resident.property_id,
                        resident.id,
                        "VOICE",
                        transcript,
                        participant=cs.caller,
                        identity_verified=cs.verification_status == "POSTCODE_VERIFIED",
                        event_key=f"voice:{cs.call_sid}",
                    )
                    for escalation in s.query(Escalation).filter_by(work_order_id=None).all():
                        try:
                            payload = json.loads(escalation.reason)
                        except (TypeError, json.JSONDecodeError):
                            continue
                        if payload.get("call_session_id") == cs.id:
                            escalation.work_order_id = cs.work_order_id
                    for call_event in s.query(CallEvent).filter_by(call_session_id=cs.id).all():
                        exists = s.query(AuditEvent).filter_by(
                            work_order_id=cs.work_order_id,
                            event=call_event.event,
                            detail=call_event.detail,
                        ).first()
                        if not exists:
                            s.add(AuditEvent(
                                work_order_id=cs.work_order_id,
                                actor="Voice Call Gate",
                                event=call_event.event,
                                detail=call_event.detail,
                            ))
                        if call_event.event == "VOICE_ESCALATION_REQUIRED":
                            try:
                                payload = json.loads(call_event.detail)
                            except (TypeError, json.JSONDecodeError):
                                payload = {}
                            level = "RED" if payload.get("flags") else "AMBER"
                            existing = s.query(Escalation).filter_by(
                                work_order_id=cs.work_order_id,
                                reason=call_event.detail,
                            ).first()
                            if not existing:
                                s.add(Escalation(
                                    work_order_id=cs.work_order_id,
                                    level=level,
                                    reason=call_event.detail,
                                ))
            cs.ended_at = cs.ended_at or utcnow()
            s.commit()
    with suppress(Exception):
        release_call_lease(call_session_id=call_session_id)
    # Persist first; email must never block the realtime voice path or post-Stream TwiML.
    def _dispatch_completion_email() -> None:
        with suppress(Exception):
            from call_notifications import dispatch_internal_call_email
            dispatch_internal_call_email(call_session_id)

    if os.getenv("VOICE_COMPLETION_EMAIL_SYNC", "").strip().lower() in {"1", "true", "yes", "on"}:
        _dispatch_completion_email()
    else:
        threading.Thread(
            target=_dispatch_completion_email,
            name=f"voice-email-{call_session_id}",
            daemon=True,
        ).start()


def validate_stream_start(start: dict, params: dict) -> int | None:
    try:
        call_session_id = int(params.get("call_session_id") or 0)
    except (TypeError, ValueError):
        return None
    call_sid = str(start.get("callSid") or "")
    supplied_call_sid = str(params.get("call_sid") or "")
    stream_sid = str(start.get("streamSid") or "")
    account_sid = str(start.get("accountSid") or "")
    media_format = start.get("mediaFormat") or {}
    if not call_session_id or not call_sid or call_sid != supplied_call_sid or not stream_sid:
        return None
    if account_sid != os.getenv("TWILIO_ACCOUNT_SID", ""):
        return None
    try:
        sample_rate = int(media_format.get("sampleRate") or 0)
        channels = int(media_format.get("channels") or 0)
    except (TypeError, ValueError):
        return None
    if media_format.get("encoding") != "audio/x-mulaw" or sample_rate != 8000:
        return None
    if channels != 1:
        return None
    if not verify_link("voice_stream", call_session_id, call_sid, str(params.get("stream_token") or "")):
        return None
    with SessionLocal() as s:
        cs = s.query(CallSession).filter_by(id=call_session_id, call_sid=call_sid).first()
        if not cs or cs.ended_at:return None
        try:bound_client_id=call_client_id(s,cs.id)
        except Exception:return None
        return cs.id if bound_client_id==configured_voice_client_id() else None


def record_stream_status(call_sid: str, stream_sid: str, event: str, error: str = "") -> None:
    operational_event("twilio_stream_status", transport="twilio", outcome=event or "unknown", stream_error=(error or "")[:500])
    with SessionLocal() as s:
        cs = s.query(CallSession).filter_by(call_sid=call_sid).first()
        if not cs:
            return
        client_id=call_client_id(s,cs.id)
        event_key=f"{call_sid}:{stream_sid}:{event}:{error}"
        _,fresh=claim_action(s,"TWILIO_STREAM_EVENT",event_key,client_id=client_id,work_order_id=cs.work_order_id)
        if not fresh:return
        detail = json.dumps({"call_session_id": cs.id, "stream_sid": stream_sid, "event": event, "error": error})
        _record_call_event(s,cs,"VOICE_STREAM_STATUS",detail,event_key)
        if cs.work_order_id:
            s.add(AuditEvent(work_order_id=cs.work_order_id, actor="Twilio", event="VOICE_STREAM_STATUS", detail=detail))
        s.commit()
    if event == "stream-error":
        record_call_interruption(cs.id, "twilio_stream_error")


async def _connect_openai(safety_identifier: str):
    model = quote(os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2.1"))
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY', '')}",
        "OpenAI-Safety-Identifier": safety_identifier,
    }
    url = f"wss://api.openai.com/v1/realtime?model={model}"
    return await websockets.connect(url, additional_headers=headers)


async def _configure_realtime(openai_ws) -> None:
    voice = os.getenv("OPENAI_REALTIME_VOICE", "alloy")
    await openai_ws.send(
        json.dumps(
            {
                "type": "session.update",
                "session": {
                    "type": "realtime",
                    "model": os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2.1"),
                    "instructions": SYSTEM_PROMPT,
                    "output_modalities": ["audio"],
                    # Shorter turns matter because audited audio is held until the
                    # matching transcript has been policy-checked.
                    "max_output_tokens": int(os.getenv("OPENAI_REALTIME_MAX_OUTPUT_TOKENS", "320")),
                    "tools": [],
                    "tool_choice": "none",
                    "audio": {
                        "input": {
                            "format": {"type": "audio/pcmu"},
                            "transcription": {"model": os.getenv("OPENAI_TRANSCRIPTION_MODEL", "gpt-live-transcribe")},
                            "turn_detection": {
                                "type": "server_vad",
                                "threshold": float(os.getenv("OPENAI_VAD_THRESHOLD", "0.5")),
                                "prefix_padding_ms": int(os.getenv("OPENAI_VAD_PREFIX_MS", "250")),
                                "silence_duration_ms": int(os.getenv("OPENAI_VAD_SILENCE_MS", "300")),
                                "create_response": True,
                                "interrupt_response": True,
                            },
                        },
                        "output": {
                            "format": {"type": "audio/pcmu"},
                            "voice": voice,
                            "speed": float(os.getenv("OPENAI_REALTIME_SPEED", "1.08")),
                        },
                    },
                },
            }
        )
    )


async def _safe_close(connection, code: int | None = None) -> None:
    if not connection:
        return
    with suppress(Exception):
        if code is None:
            await connection.close()
        else:
            await connection.close(code=code)


async def _receive_twilio_start(websocket: WebSocket) -> dict:
    connected = False
    for _ in range(4):
        raw = await websocket.receive_text()
        if not websocket_event_within_limit(raw):
            raise VoiceProtocolError("twilio_event_too_large")
        event = json.loads(raw)
        if not isinstance(event, dict):
            raise VoiceProtocolError("invalid_twilio_event")
        event_type = event.get("event")
        if event_type == "connected":
            if event.get("protocol") != "Call":
                raise VoiceProtocolError("unexpected_twilio_protocol")
            connected = True
            continue
        if event_type == "start" and connected:
            return event
        raise VoiceProtocolError("unexpected_twilio_event_order")
    raise VoiceProtocolError("missing_twilio_start")


async def handle_twilio_media_stream(websocket: WebSocket) -> None:
    if not websocket_rate_allowed(websocket):
        operational_event("websocket_rejected",transport="twilio",outcome="rate_limited")
        await _safe_close(websocket, 1013)
        return
    signature = websocket.headers.get("X-Twilio-Signature", "")
    signed_ok = validate_twilio_websocket(public_stream_url(), signature)
    ready = voice_ready()
    if not ready or not signed_ok:
        outcome = "voice_not_ready" if not ready else "signature_rejected"
        operational_event("websocket_rejected", transport="twilio", outcome=outcome)
        if signed_ok:
            await websocket.accept()
        await _safe_close(websocket, 1013 if not ready else 1008)
        return

    await websocket.accept()
    call_session_id = None
    openai_ws = None
    transfer_required = asyncio.Event()
    stop_received = asyncio.Event()

    try:
        first_event = await _receive_twilio_start(websocket)
        start = first_event.get("start") or {}
        params = start.get("customParameters") or {}
        call_session_id = validate_stream_start(start, params)
        if not claim_active_call_session(call_session_id):
            raise VoiceProtocolError("invalid_or_duplicate_call_session")

        stream_sid = str(start.get("streamSid") or "")
        call_sid = str(start.get("callSid") or "")
        openai_ws = await _connect_openai(f"maintenanceos-voice-call-{call_session_id}")
        await _configure_realtime(openai_ws)
        # The phone line is answered immediately by Twilio. Proactively create the
        # first assistant turn so callers hear a greeting instead of dead air.
        await openai_ws.send(json.dumps({
            "type": "response.create",
            "response": {
                "instructions": (
                    "Greet the caller now exactly: "
                    "Hi, thank you for calling Chapel Gate. How can we help you today? "
                    "Then wait for the caller to reply."
                )
            },
        }))
        operational_event("openai_initial_greeting_requested", transport="openai", outcome="requested")

        seen_sequences = set()
        transcript_parts = {}
        buffered_audio = []
        assistant_audio = []
        assistant_audio_bytes = 0
        assistant_text_validated = False
        # Deterministic Alleygates dialogue guards. These stop the model from
        # drifting back to the generic property-maintenance flow observed live.
        greeting_pending = True
        gate_repair_context = False
        resident_key_context = False
        master_key_context = False
        resident_key_first_answer_pending = False
        correction_attempts = 0
        # There is no caller transcript before the initial greeting. Treat the
        # greeting as a cleared turn so policy-validated greeting audio can flow.
        # Any caller speech immediately flips this back to False below.
        turn_cleared = True
        turn_number = 0
        transcription_watchdog = None
        last_output_item = None
        last_output_started = None
        last_output_ms = 0

        async def request_transfer(
            reason: str,
            already_recorded: bool = False,
            *,
            live_handoff: bool = False,
        ) -> None:
            if transfer_required.is_set():
                return
            transfer_required.set()
            transferred = False
            if live_handoff:
                with suppress(Exception):
                    transferred = await asyncio.to_thread(_request_live_human_transfer, call_sid)
            await _safe_close(websocket, 1000)
            if not already_recorded:
                with suppress(Exception):
                    record_call_interruption(call_session_id, reason)
            if live_handoff and not transferred:
                with suppress(Exception):
                    record_call_interruption(call_session_id, "human_transfer_failed")
            with suppress(Exception):
                close_call_session(call_session_id)

        async def request_corrected_response(instruction: str) -> bool:
            nonlocal correction_attempts, assistant_text_validated, assistant_audio_bytes
            if correction_attempts >= 2:
                return False
            correction_attempts += 1
            assistant_audio.clear()
            buffered_audio.clear()
            assistant_audio_bytes = 0
            assistant_text_validated = False
            await openai_ws.send(json.dumps({
                "type": "response.create",
                "response": {"instructions": instruction},
            }))
            operational_event(
                "openai_response_corrected",
                transport="openai",
                outcome="requested",
                reason_code=f"attempt_{correction_attempts}",
            )
            return True

        async def send_twilio_media(payload: str) -> None:
            await websocket.send_json({"event": "media", "streamSid": stream_sid, "media": {"payload": payload}})

        async def fail_if_transcription_missing(expected_turn: int) -> None:
            timeout = max(1.0, min(float(os.getenv("VOICE_TRANSCRIPTION_TIMEOUT_SECONDS", "5.0")), 15.0))
            await asyncio.sleep(timeout)
            if expected_turn == turn_number and not turn_cleared:
                await request_transfer("openai_transcription_timeout")

        async def from_twilio() -> None:
            media_received = False
            async for raw in websocket.iter_text():
                if not websocket_event_within_limit(raw):
                    raise VoiceProtocolError("twilio_event_too_large")
                event = json.loads(raw)
                if not isinstance(event, dict):
                    raise VoiceProtocolError("invalid_twilio_event")
                event_type = event.get("event", "")
                sequence = str(event.get("sequenceNumber") or "")
                if sequence and sequence in seen_sequences:
                    continue
                if sequence:
                    seen_sequences.add(sequence)
                    if len(seen_sequences) > MAX_SEQUENCE_KEYS:
                        raise VoiceProtocolError("too_many_twilio_events")

                if event_type == "media":
                    payload = str((event.get("media") or {}).get("payload") or "")
                    try:
                        decoded = base64.b64decode(payload, validate=True)
                    except (ValueError, TypeError):
                        raise VoiceProtocolError("invalid_twilio_media")
                    if not decoded or len(decoded) > MAX_MEDIA_PAYLOAD_BYTES:
                        raise VoiceProtocolError("invalid_twilio_media")
                    media_received = True
                    await openai_ws.send(json.dumps({"type": "input_audio_buffer.append", "audio": payload}))
                elif event_type == "dtmf" and str((event.get("dtmf") or {}).get("digit")) == "0":
                    await request_transfer("caller_requested_human", live_handoff=True)
                    return
                elif event_type == "stop":
                    stop_received.set()
                    if media_received:
                        with suppress(Exception):
                            await openai_ws.send(json.dumps({"type": "input_audio_buffer.commit"}))
                    grace = max(0.0, min(float(os.getenv("VOICE_TRANSCRIPT_GRACE_SECONDS", "1.0")), 3.0))
                    await asyncio.sleep(grace)
                    close_call_session(call_session_id)
                    return

        async def from_openai() -> None:
            nonlocal turn_cleared, turn_number, transcription_watchdog,assistant_text_validated
            nonlocal last_output_item, last_output_started, last_output_ms,assistant_audio_bytes
            nonlocal greeting_pending, gate_repair_context, resident_key_context, master_key_context
            nonlocal resident_key_first_answer_pending, correction_attempts
            async for raw in openai_ws:
                if not websocket_event_within_limit(raw):
                    raise VoiceProtocolError("openai_event_too_large")
                event = json.loads(raw)
                if not isinstance(event, dict):
                    raise VoiceProtocolError("invalid_openai_event")
                event_type = event.get("type", "")

                if event_type == "input_audio_buffer.speech_started":
                    turn_cleared = False
                    turn_number += 1
                    if transcription_watchdog:
                        transcription_watchdog.cancel()
                        transcription_watchdog = None
                    buffered_audio.clear()
                    assistant_audio.clear()
                    assistant_audio_bytes=0
                    assistant_text_validated=False
                    correction_attempts=0
                    await websocket.send_json({"event": "clear", "streamSid": stream_sid})
                    if last_output_item and last_output_ms > 0:
                        played_ms = min(last_output_ms, int((time.monotonic() - last_output_started) * 1000))
                        await openai_ws.send(json.dumps({
                            "type": "conversation.item.truncate",
                            "item_id": last_output_item,
                            "content_index": 0,
                            "audio_end_ms": max(0, played_ms),
                        }))
                    last_output_item = None
                    last_output_started = None
                    last_output_ms = 0
                elif event_type == "input_audio_buffer.speech_stopped":
                    if transcription_watchdog:
                        transcription_watchdog.cancel()
                    transcription_watchdog = asyncio.create_task(fail_if_transcription_missing(turn_number))
                elif event_type == "conversation.item.input_audio_transcription.delta":
                    item_id = str(event.get("item_id") or "current")
                    transcript = transcript_parts.get(item_id, "") + str(event.get("delta") or "")
                    if len(transcript) > MAX_TRANSCRIPT_CHARS:
                        raise VoiceProtocolError("input_transcript_too_large")
                    transcript_parts[item_id] = transcript
                elif event_type == "conversation.item.input_audio_transcription.completed":
                    item_id = str(event.get("item_id") or "current")
                    transcript = str(event.get("transcript") or transcript_parts.get(item_id, ""))
                    if len(transcript) > MAX_TRANSCRIPT_CHARS:
                        raise VoiceProtocolError("input_transcript_too_large")
                    transcript_parts.pop(item_id, None)
                    if transcription_watchdog:
                        transcription_watchdog.cancel()
                        transcription_watchdog = None

                    lowered = transcript.casefold()
                    # If the caller speaks before the opening turn completes (barge-in),
                    # do not force a greeting over the top of their live enquiry.
                    greeting_pending = False
                    explicit_master = "master key" in lowered or "master-key" in lowered
                    if explicit_master:
                        master_key_context = True
                        resident_key_context = False
                        resident_key_first_answer_pending = False
                    elif "key" in lowered:
                        # Keep ordinary resident-key intent sticky across subsequent short
                        # follow-up turns; only an explicit master-key request switches it.
                        if not resident_key_context:
                            resident_key_first_answer_pending = True
                        resident_key_context = True
                    gate_terms = ("gate", "alley gate", "alleygate")
                    fault_terms = (
                        "repair", "broken", "fault", "damaged", "jammed", "lock",
                        "won't close", "will not close", "won't open", "will not open",
                    )
                    if any(term in lowered for term in gate_terms) and any(term in lowered for term in fault_terms):
                        gate_repair_context = True

                    escalate_now, escalation_reason, _flags = requires_immediate_human_escalation(transcript)
                    escalated = record_transcript_segment(call_session_id, "Caller", transcript)
                    if escalated:
                        live_handoff = (
                            escalation_reason == "gate_emergency_handoff"
                            or _explicit_human_request(transcript)
                        )
                        await request_transfer(
                            escalation_reason or "deterministic_escalation",
                            already_recorded=True,
                            live_handoff=live_handoff,
                        )
                        return
                    turn_cleared = True
                    if assistant_text_validated:
                        buffered_audio.extend(assistant_audio)
                        assistant_audio.clear()
                        assistant_audio_bytes=0
                    for payload in buffered_audio:
                        await send_twilio_media(payload)
                    buffered_audio.clear()
                elif event_type == "conversation.item.input_audio_transcription.failed":
                    await request_transfer("openai_transcription_failed")
                    return
                elif event_type in ("response.output_audio.delta", "response.audio.delta"):
                    payload = str(event.get("delta") or "")
                    if not payload:
                        continue
                    try:
                        decoded = base64.b64decode(payload, validate=True)
                    except (ValueError, TypeError):
                        raise VoiceProtocolError("invalid_openai_audio")
                    assistant_audio_bytes += len(decoded)
                    if assistant_audio_bytes > MAX_BUFFERED_AUDIO_BYTES:
                        raise VoiceProtocolError("openai_audio_buffer_too_large")
                    item_id = str(event.get("item_id") or "")
                    if item_id and item_id != last_output_item:
                        last_output_item = item_id
                        last_output_started = time.monotonic()
                        last_output_ms = 0
                    last_output_ms += len(decoded) // 8
                    assistant_audio.append(payload)
                elif event_type == "response.output_audio_transcript.done":
                    transcript=str(event.get("transcript") or "")
                    if len(transcript)>MAX_TRANSCRIPT_CHARS:
                        raise VoiceProtocolError("output_transcript_too_large")
                    lowered_output = transcript.casefold()
                    expected_greeting = "hi, thank you for calling chapel gate. how can we help you today?"
                    if greeting_pending:
                        normalised = " ".join(
                            re.sub(r"[^a-z0-9 ]+", " ", lowered_output).split()
                        )
                        expected_normalised = " ".join(
                            re.sub(r"[^a-z0-9 ]+", " ", expected_greeting).split()
                        )
                        if normalised != expected_normalised:
                            if await request_corrected_response(
                                "Say exactly: Hi, thank you for calling Chapel Gate. "
                                "How can we help you today? Say nothing else and then wait."
                            ):
                                continue
                            await request_transfer("initial_greeting_contract_failed")
                            return
                        greeting_pending = False

                    if gate_repair_context and "postcode" in lowered_output:
                        if await request_corrected_response(
                            "This is an alley-gate repair. Do not ask for any postcode. "
                            "Ask for the caller's full name, their own address and callback number "
                            "if not already collected, then ask whether the gate is in Wirral or Sefton "
                            "and ask for the gate number."
                        ):
                            continue
                        await request_transfer("gate_postcode_contract_failed")
                        return

                    if resident_key_context and not master_key_context:
                        # Do not force every follow-up answer to repeat URL + price. That
                        # made real calls sound confused when callers asked a different
                        # question about the same key. Enforce the full route only on the
                        # first resident-key answer; thereafter preserve context and block
                        # cross-contamination with master-key/third-party advice.
                        forbidden_resident_key = any(term in lowered_output for term in (
                            "master key", "landlord", "housing provider", "housing association",
                        ))
                        required_resident_route = (
                            "alleygates.co.uk" in lowered_output
                            and ("£22" in transcript or "22" in lowered_output)
                            and "gate number" in lowered_output
                        )
                        if forbidden_resident_key or (resident_key_first_answer_pending and not required_resident_route):
                            if await request_corrected_response(
                                "This is an ordinary resident alley-gate key enquiry. Keep the resident-key "
                                "topic active and answer the caller's latest question directly. For the first "
                                "key answer, give www.alleygates.co.uk, £22 including VAT and recorded delivery, "
                                "and say they need the gate number to order online. For later follow-ups, do not "
                                "repeat the whole script unless needed. Never mention live orders, order tracking, "
                                "or access to an order system. "
                                "If online ordering or payment cannot be used, info@alleygates.co.uk can arrange "
                                "cash or bank transfer. Do not mention master keys, landlords or housing providers, "
                                "and do not invent facts that are not in the supplied rules."
                            ):
                                continue
                            await request_transfer("resident_key_contract_failed")
                            return
                        resident_key_first_answer_pending = False

                    transfer_language = any(phrase in lowered_output for phrase in (
                        "put you through", "transfer you", "transfer the call",
                        "member of the team", "team member",
                        "speak to someone", "speak to a person",
                    ))
                    if transfer_language:
                        if await request_corrected_response(
                            "Answer the caller directly. Do not mention a team member, human operator, "
                            "transfer, colleague, or putting the caller through. A transfer may only be "
                            "mentioned after the caller explicitly asks for a person or for a genuine "
                            "gate emergency, and those cases are handled deterministically."
                        ):
                            continue
                        await request_transfer("proactive_handoff_language_blocked")
                        return

                    with SessionLocal() as s:
                        cs=s.get(CallSession,call_session_id)
                        state=_summary_state(cs) if cs else {}
                        critical=bool(state.get("safety_flags"))
                        verified_actions=verified_actions_for_work_order(s,cs.work_order_id if cs else None)
                        identity_verified,private_markers=_voice_disclosure_context(s,cs)
                    allowed,reason=validate_assistant_text(
                        transcript,
                        critical_active=critical,
                        verified_actions=verified_actions,
                        identity_verified=identity_verified,
                        private_markers=private_markers,
                    )
                    if not allowed:
                        assistant_audio.clear();buffered_audio.clear();assistant_audio_bytes=0
                        await request_transfer(f"assistant_policy_rejected:{reason}")
                        return
                    record_transcript_segment(call_session_id, "Assistant", transcript)
                    assistant_text_validated=True
                    if turn_cleared:
                        for payload in assistant_audio:await send_twilio_media(payload)
                        assistant_audio.clear();assistant_audio_bytes=0
                elif event_type == "response.function_call_arguments.done":
                    with SessionLocal() as s:
                        cs=s.get(CallSession,call_session_id)
                        bound_client_id=call_client_id(s,cs.id) if cs else None
                        allowed,reason=authorize_model_action(
                            s,
                            cs.work_order_id if cs else None,
                            str(event.get("name") or ""),
                            str(event.get("call_id") or ""),
                            client_id=bound_client_id,
                        )
                        s.commit()
                    if not allowed:
                        await request_transfer(f"model_action_rejected:{reason}")
                        return
                elif event_type == "error":
                    error = event.get("error") or {}
                    code = re.sub(r"[^a-zA-Z0-9_.-]", "_", str(error.get("code") or "unknown"))[:64]
                    await request_transfer(f"openai_realtime_error:{code}")
                    return
                elif event_type == "response.done":
                    if (event.get("response") or {}).get("status") in {"failed", "incomplete"}:
                        await request_transfer("openai_response_failed")
                        return
                    if assistant_audio and not assistant_text_validated:
                        assistant_audio.clear()
                        await request_transfer("openai_output_transcript_missing")
                        return

        twilio_task = asyncio.create_task(from_twilio())
        openai_task = asyncio.create_task(from_openai())
        done, pending = await asyncio.wait({twilio_task, openai_task}, return_when=asyncio.FIRST_COMPLETED)
        if stop_received.is_set() and not twilio_task.done():
            # A provider transport may close immediately after Twilio sends stop.
            # Let the Twilio task finish its bounded transcript grace and persist call closure.
            await twilio_task
            done.add(twilio_task)
            pending.discard(twilio_task)
        for task in done:
            error = task.exception()
            if error:
                raise error
        if not stop_received.is_set() and not transfer_required.is_set():
            await request_transfer("voice_transport_disconnected")
        await _safe_close(openai_ws)
        for task in pending:
            task.cancel()
        await asyncio.gather(*pending, return_exceptions=True)
    except Exception as exc:
        if call_session_id:
            await _safe_close(websocket,1000)
            with suppress(Exception):record_call_interruption(call_session_id, f"voice_bridge_failure:{type(exc).__name__}")
            with suppress(Exception):close_call_session(call_session_id)
        else:
            await _safe_close(websocket,1008)
    finally:
        if 'transcription_watchdog' in locals() and transcription_watchdog:
            transcription_watchdog.cancel()
        await _safe_close(openai_ws)
        if call_session_id:
            release_active_call_session(call_session_id)
