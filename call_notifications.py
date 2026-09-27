"""Internal call-intake email notifications for Chapelgate voice sessions.

Persist the call/job first, then attempt email. Email failures must never
undo persistence. Duplicate Twilio stop/close callbacks are idempotent.
"""

from __future__ import annotations

import os
import re
from typing import Any

from communications import queue_outbound, record_delivery_status
from email_gateway import live_email_enabled, pilot_resend_ready, send_email

from idempotency import claim_action
from models import CallSession, Property, Resident, SessionLocal, WorkOrder
from operational_logging import operational_event
from tenant_security import call_client_id

CATEGORY_REPAIR = "repair"
CATEGORY_KEY = "key"
CATEGORY_MASTER_KEY = "master_key"
CATEGORY_CALL_REVIEW = "call_review"
ACTIONABLE_CATEGORIES = {CATEGORY_REPAIR, CATEGORY_KEY, CATEGORY_MASTER_KEY, CATEGORY_CALL_REVIEW}

_MASTER_KEY = re.compile(
    r"\bmaster\s*keys?\b|\brestricted\s+keys?\b|\bmaster\s+key\s+application\b",
    re.IGNORECASE,
)
_KEY = re.compile(
    r"\b(?:order|buy|purchase|need|want|replace|lost|replacement)\b.*\bkeys?\b"
    r"|\bkeys?\b.*\b(?:order|buy|purchase|website|alleygates)\b"
    r"|\b£\s*22\b|\b22\s*(?:pounds|quid)?\b.*\bkey",
    re.IGNORECASE,
)
_REPAIR = re.compile(
    r"\b(?:repair|broken|fault|damaged|stuck|won't\s+open|will\s+not\s+open|"
    r"lock\s+(?:fault|broken|jammed)|gate\s+(?:fault|broken|damaged)|"
    r"maintenance|cylinder|hinge)\b",
    re.IGNORECASE,
)
_GATE_NUM = re.compile(r"\bgate\s*(?:number\s*)?(?:is\s*|no\.?\s*|#\s*)?(\d{1,5})\b", re.IGNORECASE)
_AREA = re.compile(r"\b(Wirral|Sefton)\b", re.IGNORECASE)
_URGENCY = re.compile(
    r"\b(urgent|emergency|asap|as soon as possible|today|tonight|"
    r"24\s*to\s*48|two to four weeks)\b",
    re.IGNORECASE,
)
_CALLBACK = re.compile(
    r"(?:callback|call\s*back|contact(?:\s+number)?|my\s+number|phone(?:\s+number)?|telephone(?:\s+number)?)"
    r"[:\s]+(\+?\d[\d\s()-]{7,}\d)",
    re.IGNORECASE,
)
_NAME = re.compile(
    r"(?:(?:my\s+name\s+is|this\s+is|name(?:\s+is)?|I\s+am)\s+)"
    r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})",
)
_EMAIL = re.compile(r"\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b", re.IGNORECASE)
_CONFIRMED_EMAIL = re.compile(
    r"(?:confirm(?:ed|ing)?|yes[,.]?\s+(?:that(?:'s| is)\s+)?(?:my\s+)?email)"
    r".{0,40}" + _EMAIL.pattern
    + r"|" + _EMAIL.pattern + r".{0,40}(?:confirm(?:ed)?|correct|yes)\b",
    re.IGNORECASE,
)


def internal_notification_email() -> str:
    return (
        os.getenv("INTERNAL_NOTIFICATION_EMAIL")
        or os.getenv("CHAPELGATE_NOTIFICATION_EMAIL")
        or ""
    ).strip()


def classify_call_category(transcript: str) -> str | None:
    text = transcript or ""
    if _MASTER_KEY.search(text):
        return CATEGORY_MASTER_KEY
    if _KEY.search(text):
        return CATEGORY_KEY
    if _REPAIR.search(text):
        return CATEGORY_REPAIR
    return None


def _caller_lines(transcript: str) -> list[str]:
    raw_lines = [raw.strip() for raw in (transcript or "").splitlines() if raw.strip()]
    has_roles = any(
        line.casefold().startswith(("caller:", "assistant:"))
        for line in raw_lines
    )
    if not has_roles:
        return raw_lines

    lines = []
    for line in raw_lines:
        if line.casefold().startswith("caller:"):
            lines.append(line.split(":", 1)[1].strip())
    return lines


def _assistant_lines(transcript: str) -> list[str]:
    lines = []
    for raw in (transcript or "").splitlines():
        line = raw.strip()
        if line.casefold().startswith("assistant:"):
            lines.append(line.split(":", 1)[1].strip())
    return lines


def extract_call_details(transcript: str, *, job_reference: str) -> dict[str, Any]:
    caller_lines = _caller_lines(transcript)
    assistant_lines = _assistant_lines(transcript)
    caller_text = "\n".join(caller_lines)
    assistant_text = "\n".join(assistant_lines)
    full = transcript or ""

    # Prefer the assistant's explicit read-back: it is the structured confirmation
    # the caller heard, and is usually cleaner than realtime STT fragments.
    confirmed_gate_area = re.findall(
        r"\bgate\s+(\d{1,5})\s+in\s+(Wirral|Sefton)\b",
        assistant_text,
        re.IGNORECASE,
    )
    if confirmed_gate_area:
        gate_value, area_value = confirmed_gate_area[-1]
    else:
        gate = _GATE_NUM.search(assistant_text) or _GATE_NUM.search(caller_text) or _GATE_NUM.search(full)
        gate_value = gate.group(1) if gate else ""
        # Never infer Wirral/Sefton from the receptionist merely asking the question.
        area_match = _AREA.search(caller_text)
        area_value = area_match.group(1) if area_match else ""

    confirmed_name = re.findall(
        r"\byour\s+name(?:'s|\s+is)\s+([^,\.\n]{2,80})",
        assistant_text,
        re.IGNORECASE,
    )
    raw_name = _NAME.search(caller_text)
    honorific_name = re.search(
        r"\b(?:Mr|Mrs|Ms|Miss|Dr)\s+([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){0,2})",
        caller_text,
    )
    name_value = (
        confirmed_name[-1].strip()
        if confirmed_name
        else (honorific_name.group(1).strip() if honorific_name else (raw_name.group(1).strip() if raw_name else ""))
    )

    confirmed_callback = re.findall(
        r"\byour\s+(?:callback\s+|phone\s+)?number(?:'s|\s+is)\s+(\+?\d[\d\s()-]{7,}\d)",
        assistant_text,
        re.IGNORECASE,
    )
    raw_callback = _CALLBACK.search(caller_text)
    callback_value = confirmed_callback[-1] if confirmed_callback else (raw_callback.group(1) if raw_callback else "")
    callback_value = re.sub(r"\s+", " ", callback_value).strip()

    confirmed_addresses = re.findall(
        r"\byour\s+address(?:'s|\s+is)\s+([^\.\n]{4,180})"
        r"|\b(?:you're|you\s+are)\s+at\s+([^\.\n]{4,180})"
        r"|\blocated\s+at\s+([^\.\n]{4,180})",
        assistant_text,
        re.IGNORECASE,
    )
    address = ""
    if confirmed_addresses:
        parts = confirmed_addresses[-1]
        address = next((part.strip() for part in parts if part), "")
    if not address:
        for line in caller_lines:
            lowered = line.casefold()
            if any(k in lowered for k in ("address", "live at", "i live", "postcode", "road", "street", "avenue", "close", "lane", "way", "grove")):
                address = line
                break

    postcode_match = re.search(
        r"\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b",
        f"{address}\n{full}",
        re.IGNORECASE,
    )
    postcode = ""
    if postcode_match:
        compact = re.sub(r"\s+", "", postcode_match.group(1)).upper()
        postcode = compact[:-3] + " " + compact[-3:]
        if address:
            address = re.sub(
                re.escape(postcode_match.group(1)),
                "",
                address,
                flags=re.IGNORECASE,
            ).strip(" ,")

    fault = ""
    fault_patterns = [
        r"\bthe\s+problem\s+is\s+(.+?)(?:,\s*(?:at\s+)?gate\s+\d+|\.\s|$)",
        r"\breported\s+that\s+(.+?)(?:\s+on\s+gate\s+\d+|\.\s|$)",
        r"\bfault\s+is\s+(.+?)(?:,\s*(?:at\s+)?gate\s+\d+|\.\s|$)",
        r"\b((?:the\s+)?(?:lock|gate|hinge|cylinder)\s+is\s+(?:missing|broken|damaged|jammed|stuck)(?:\s+due\s+to\s+vandalism)?)",
    ]
    for pattern in fault_patterns:
        matches = re.findall(pattern, assistant_text, re.IGNORECASE)
        if matches:
            fault = matches[-1].strip(" ,.")
            break
    if not fault:
        # Prefer a clean receptionist confirmation sentence over garbled realtime STT.
        for line in assistant_lines:
            for sentence in re.split(r"(?<=[.!?])\s+", line):
                if sentence.rstrip().endswith("?"):
                    continue
                if (
                    re.search(r"\b(?:lock|gate|hinge|cylinder)\b", sentence, re.IGNORECASE)
                    and re.search(r"\b(?:missing|broken|damaged|jammed|stuck|vandali[sz])\w*\b", sentence, re.IGNORECASE)
                ):
                    fault = sentence.strip(" ,.")
                    break
            if fault:
                break
    if not fault:
        for line in caller_lines:
            if _REPAIR.search(line):
                fault = line.strip()
                break
    if not fault:
        for line in caller_lines:
            if "problem" in line.casefold() or "issue" in line.casefold():
                fault = line.strip()
                break

    urgency = _URGENCY.search(caller_text)
    category = classify_call_category(full)

    return {
        "category": category,
        "caller_name": name_value,
        "callback_number": callback_value,
        "caller_address": address,
        "postcode": postcode,
        "area": area_value,
        "gate_number": gate_value,
        "fault_or_request": fault,
        "urgency": urgency.group(1) if urgency else "",
        "job_reference": job_reference,
        "transcript": full.strip()[:6000],
    }


def build_internal_email(details: dict[str, Any]) -> tuple[str, str]:
    category = details.get("category") or "unknown"
    job_ref = details.get("job_reference") or "unknown"
    transcript = details.get("transcript") or ""
    caller_lines = _caller_lines(transcript)
    full = transcript

    # A clean confirmed repair read-back outranks later secondary enquiries.
    has_repair = bool(details.get("fault_or_request")) or bool(_REPAIR.search(full))
    has_master_key = bool(_MASTER_KEY.search(full)) or category == CATEGORY_MASTER_KEY

    ordinary_key_text = _MASTER_KEY.sub("", full)
    key_order_signal = re.compile(
        r"(?:\border(?:ed|ing)?\b.*\bkeys?\b"
        r"|\bkeys?\b.*\b(?:order(?:ed|ing)?|delivery|tracking|website|email|buy|purchase)\b"
        r"|confirmation\s+email.*order\s+number"
        r"|keys?\s+are\s+sent\s+by\s+royal\s+mail"
        r"|tracking\s+(?:info|information).*dispatch"
        r"|keys?\s+are\s+currently\s+(?:£\s*)?22"
        r"|order.*online.*alleygates\.co\.uk)",
        re.IGNORECASE | re.DOTALL,
    )
    has_key = bool(_KEY.search(ordinary_key_text) or key_order_signal.search(ordinary_key_text)) or category == CATEGORY_KEY

    gate = details.get("gate_number") or "not collected"
    if has_repair:
        subject = f"[REPAIR] Gate {gate} - {job_ref}"
    elif has_key:
        subject = f"[KEY REQUEST] Alley-gate key enquiry {job_ref}"
    elif has_master_key:
        subject = f"[MASTER KEY APPLICATION] Restricted enquiry {job_ref}"
    else:
        subject = f"[CALL REVIEW] Chapelgate phone call {job_ref}"

    lines: list[str] = []

    if has_repair:
        lines.extend([
            "Chapelgate Alleygate Repair Call Report",
            "======================================",
            "",
            f"Job ID: {job_ref}",
            f"Gate Number: {gate}",
            f"Resident Name: {details.get('caller_name') or 'not collected'}",
            f"Contact Number: {details.get('callback_number') or 'not collected'}",
            f"Address: {details.get('caller_address') or 'not collected'}",
            f"Postcode: {details.get('postcode') or 'not collected'}",
            f"Area: {details.get('area') or 'not collected'}",
            f"Fault Details: {details.get('fault_or_request') or 'not collected'}",
        ])
        if details.get("urgency"):
            lines.append(f"Urgency: {details['urgency']}")
        lines.append("")

    existing_order = bool(re.search(
        r"(?:already\s+ordered|confirmation\s+email.*order\s+number|reply\s+to\s+that\s+email|royal\s+mail|tracking\s+(?:info|information))",
        full,
        re.IGNORECASE | re.DOTALL,
    ))
    new_key_order = bool(re.search(
        r"(?:order.*online.*alleygates\.co\.uk|keys?\s+are\s+currently\s+(?:£\s*)?22|key\s+orders?\s+are\s+placed)",
        full,
        re.IGNORECASE | re.DOTALL,
    ))
    if has_key:
        phone_order_requested = bool(re.search(
            r"\b(?:on|over)\s+the\s+phone\b|\bdo\s+it\s+on\s+the\s+phone\b",
            full,
            re.IGNORECASE,
        ))
        lines.extend([
            "KEY ORDER / ENQUIRY",
            "===================",
        ])
        if existing_order:
            lines.extend([
                "Existing order/update requested: Yes",
                "Order update route: reply to the order confirmation email.",
                "Delivery: Royal Mail; tracking is emailed when dispatched.",
            ])
        if new_key_order:
            lines.extend([
                "New key order enquiry: Yes",
                f"Telephone ordering requested: {'Yes' if phone_order_requested else 'No'}",
                "Outcome: no key order was taken during the call; caller was directed to alleygates.co.uk.",
            ])
        if not existing_order and not new_key_order:
            lines.append("Key enquiry noted; no order was taken during the call.")
        lines.append("")

    if has_master_key:
        lines.extend([
            "MASTER-KEY ENQUIRY",
            "==================",
            "Restricted application enquiry only - approval is not guaranteed.",
            "Application route: info@alleygates.co.uk from an official organisation/work email.",
            "",
        ])

    other_notes = []
    other_patterns = (
        r"car\s+blocking",
        r"leav(?:e|ing|es).*gate.*open",
        r"neighbou?r",
    )
    for line in caller_lines:
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in other_patterns):
            other_notes.append(line)

    lines.extend([
        "OTHER INFORMATION",
        "=================",
    ])
    if other_notes:
        lines.extend([f"- {line}" for line in other_notes])
    else:
        lines.append("- No additional operational information captured.")
    lines.extend([
        "",
        "FULL TRANSCRIPT",
        "===============",
        transcript or "(empty)",
    ])

    return subject, "\n".join(lines)


def _intake_property_id(session, client_id: int) -> int | None:
    prop = session.query(Property).filter_by(client_id=client_id).order_by(Property.id.asc()).first()
    return prop.id if prop else None


def ensure_voice_work_order(session, cs: CallSession, client_id: int, category: str) -> int | None:
    if cs.work_order_id:
        return cs.work_order_id
    property_id = None
    resident_id = cs.resident_id
    if resident_id:
        resident = session.query(Resident).filter_by(id=resident_id, client_id=client_id).first()
        if resident:
            property_id = resident.property_id
    if property_id is None:
        property_id = _intake_property_id(session, client_id)
    if property_id is None:
        return None
    # Create a lightweight work order in-session to avoid nested SessionLocal races.
    description = f"Voice {category} intake\n{cs.transcript}".strip()
    wo = WorkOrder(
        client_id=client_id,
        property_id=property_id,
        resident_id=resident_id,
        source="VOICE",
        description=description[:8000],
        status="NEW",
    )
    session.add(wo)
    session.flush()
    cs.work_order_id = wo.id
    return wo.id


def confirmed_customer_email(transcript: str) -> str:
    match = _CONFIRMED_EMAIL.search(transcript or "")
    if not match:
        return ""
    for group in match.groups():
        if group and "@" in group:
            return group.strip()
    return ""


def dispatch_internal_call_email(call_session_id: int) -> dict[str, Any]:
    """Send internal notification for an already-persisted call session.

    Safe to call repeatedly. Never raises to the voice lifecycle caller.
    """
    result: dict[str, Any] = {"sent": False, "skipped": True, "reason": "init"}
    operational_event(
        "voice_notification",
        transport="email",
        outcome="notification_started",
        reason_code=str(call_session_id),
    )
    try:
        with SessionLocal() as session:
            cs = session.query(CallSession).filter_by(id=call_session_id).first()
            if not cs:
                result["reason"] = "missing_call"
                operational_event("voice_notification", transport="email", outcome="missing_call")
                return result
            client_id = call_client_id(session, cs.id)
            if not client_id:
                result["reason"] = "missing_tenant"
                operational_event("voice_notification", transport="email", outcome="missing_tenant")
                return result
            transcript = (cs.transcript or "").strip()
            if not transcript:
                operational_event(
                    "voice_notification",
                    transport="email",
                    outcome="empty_incomplete_transcript",
                )
            category = classify_call_category(transcript) or CATEGORY_CALL_REVIEW
            # Never silently lose a completed pilot call because realtime
            # transcription/classification was incomplete. Recognised repair/key
            # calls keep their specific subject; anything else becomes CALL REVIEW.
            operational_event(
                "voice_notification",
                transport="email",
                outcome="classification",
                reason_code=category,
            )

            job_reference = f"CG-{cs.id:06d}"
            action_key = f"voice-internal-email:{cs.call_sid}:{category}"
            _, fresh = claim_action(
                session,
                "VOICE_INTERNAL_EMAIL",
                action_key,
                client_id=client_id,
                work_order_id=cs.work_order_id,
            )
            if not fresh:
                session.commit()
                result.update({"skipped": True, "reason": "idempotent_duplicate", "category": category})
                operational_event(
                    "voice_notification",
                    transport="email",
                    outcome="duplicate_suppressed",
                    reason_code=category,
                )
                return result

            work_order_id = ensure_voice_work_order(session, cs, client_id, category)
            if not work_order_id:
                session.commit()
                result["reason"] = "no_work_order"
                operational_event(
                    "voice_notification",
                    transport="email",
                    outcome="no_work_order",
                    reason_code=category,
                )
                return result

            recipient = internal_notification_email()
            if not recipient:
                session.commit()
                result["reason"] = "recipient_unconfigured"
                operational_event(
                    "voice_notification",
                    transport="email",
                    outcome="recipient",
                    reason_code="unconfigured",
                )
                return result
            operational_event(
                "voice_notification",
                transport="email",
                outcome="recipient",
                reason_code="resolved",
            )

            details = extract_call_details(transcript, job_reference=job_reference)
            details["category"] = category
            subject, body = build_internal_email(details)
            delivery = queue_outbound(
                session,
                client_id=client_id,
                work_order_id=work_order_id,
                channel="EMAIL",
                recipient=recipient,
                body=f"{subject}\n\n{body}",
                action_key=action_key,
            )
            session.commit()
            delivery_id = delivery.id

        # Delivery attempt is outside the persistence transaction.
        # Pilot-armed Resend HTTPS may proceed even when ENABLE_LIVE_EMAIL is false.
        if not live_email_enabled() and not pilot_resend_ready():
            with SessionLocal() as session:
                record_delivery_status(
                    session, delivery_id, "FAILED", failure_code="live_email_disabled"
                )
                session.commit()
            result.update({"skipped": True, "reason": "live_email_disabled", "category": category})
            operational_event(
                "voice_notification",
                transport="email",
                outcome="live_email_disabled",
                reason_code=category,
            )
            return result

        try:
            with SessionLocal() as session:
                record_delivery_status(session, delivery_id, "ATTEMPTED")
                session.commit()
            operational_event(
                "voice_notification",
                transport="email",
                outcome="provider_attempt",
                reason_code=category,
            )
            # Never allow a 30s SMTP timeout on the call-completion path.
            send_result = send_email(recipient, subject, body, allow_smtp_fallback=False)
            provider_ref = str(send_result.get("message_id") or "")[:200]
            if send_result.get("mock"):
                with SessionLocal() as session:
                    record_delivery_status(
                        session, delivery_id, "FAILED", failure_code="mock_email_not_live"
                    )
                    session.commit()
                result.update({"skipped": True, "reason": "mock_email", "category": category})
                operational_event(
                    "voice_notification",
                    transport="email",
                    outcome="provider_failure",
                    reason_code="mock_rejected",
                )
                return result
            with SessionLocal() as session:
                record_delivery_status(
                    session, delivery_id, "SENT", provider_reference=provider_ref or "smtp-sent"
                )
                session.commit()
            result.update(
                {
                    "sent": True,
                    "skipped": False,
                    "reason": "sent",
                    "category": category,
                    "provider_reference": provider_ref,
                }
            )
            operational_event(
                "voice_notification",
                transport="email",
                outcome="provider_success",
                reason_code=category,
            )
            operational_event(
                "voice_notification",
                transport="email",
                outcome="sent",
                reason_code=category,
            )
            try:
                from pilot.runtime_guard import record_pilot_scorecard_event
                record_pilot_scorecard_event("email_delivered")
            except Exception:
                # Notification success must not be reversed by scorecard telemetry.
                pass
            return result
        except Exception as exc:
            with SessionLocal() as session:
                record_delivery_status(
                    session,
                    delivery_id,
                    "FAILED",
                    failure_code=type(exc).__name__[:100],
                )
                session.commit()
            result.update(
                {
                    "sent": False,
                    "skipped": False,
                    "reason": "send_failed",
                    "category": category,
                    "error_type": type(exc).__name__,
                }
            )
            operational_event(
                "voice_notification",
                transport="email",
                outcome="provider_failure",
                reason_code=type(exc).__name__,
            )
            return result
    except Exception as exc:
        operational_event(
            "voice_notification",
            transport="email",
            outcome="pipeline_error",
            reason_code=type(exc).__name__,
        )
        result.update({"reason": "pipeline_error", "error_type": type(exc).__name__})
        return result
