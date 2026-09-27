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
    r"(?:callback|call\s*back|contact(?:\s+number)?|my\s+number|phone(?:\s+number)?)"
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


def extract_call_details(transcript: str, *, job_reference: str) -> dict[str, Any]:
    caller_lines = _caller_lines(transcript)
    caller_text = "\n".join(caller_lines)
    full = transcript or ""

    gate = _GATE_NUM.search(caller_text) or _GATE_NUM.search(full)

    confirmed_areas = re.findall(
        r"\bgate\s+\d{1,5}\s+in\s+(Wirral|Sefton)\b",
        full,
        re.IGNORECASE,
    )
    area_match = _AREA.search(caller_text)
    area_value = confirmed_areas[-1] if confirmed_areas else (area_match.group(1) if area_match else "")

    urgency = _URGENCY.search(caller_text)

    callback = _CALLBACK.search(caller_text)
    if not callback:
        callback = re.search(
            r"\b(?:my|your)\s+(?:phone\s+)?number(?:\s+is)?\s*[:\-]?\s*(\+?\d[\d\s()-]{7,}\d)",
            full,
            re.IGNORECASE,
        )

    name = _NAME.search(caller_text)
    confirmed_name = re.findall(
        r"\byour\s+name(?:'s|\s+is)\s+([^,\n]{2,80})(?=,|\n|$)",
        full,
        re.IGNORECASE,
    )
    name_value = confirmed_name[-1].strip() if confirmed_name else (name.group(1).strip() if name else "")

    confirmed_addresses = re.findall(
        r"\b(?:you're|you\s+are)\s+at\s+([^\.\n]{4,160})",
        full,
        re.IGNORECASE,
    )
    address = confirmed_addresses[-1].strip() if confirmed_addresses else ""
    if not address:
        for line in caller_lines:
            lowered = line.casefold()
            if any(k in lowered for k in ("address", "live at", "i live", "postcode", "road", "street", "avenue", "close", "lane")):
                address = line
                break

    fault = ""
    for line in caller_lines:
        if _REPAIR.search(line):
            fault = line
            break
    if not fault:
        for line in caller_lines:
            if "problem" in line.casefold() or "issue" in line.casefold():
                fault = line
                break

    category = classify_call_category(full)
    summary_bits = [ln for ln in caller_lines if ln][:8]

    return {
        "category": category,
        "caller_name": name_value,
        "callback_number": re.sub(r"\s+", " ", callback.group(1)).strip() if callback else "",
        "caller_address": address,
        "area": area_value,
        "gate_number": gate.group(1) if gate else "",
        "fault_or_request": fault,
        "urgency": urgency.group(1) if urgency else "",
        "job_reference": job_reference,
        "summary": " | ".join(summary_bits)[:800],
        "transcript": full.strip()[:6000],
    }


def build_internal_email(details: dict[str, Any]) -> tuple[str, str]:
    category = details.get("category") or "unknown"
    job_ref = details.get("job_reference") or "unknown"
    transcript = details.get("transcript") or ""
    caller_lines = _caller_lines(transcript)
    caller_text = "\n".join(caller_lines)
    topic_text = caller_text or transcript

    has_repair = bool(_REPAIR.search(topic_text)) or category == CATEGORY_REPAIR
    has_master_key = bool(_MASTER_KEY.search(topic_text)) or category == CATEGORY_MASTER_KEY
    ordinary_key_text = _MASTER_KEY.sub("", topic_text)
    key_order_signal = re.compile(
        r"(?:\border(?:ed|ing)?\b.*\bkeys?\b|\bkeys?\b.*\b(?:order(?:ed|ing)?|delivery|tracking|website|email|buy|purchase)\b)",
        re.IGNORECASE,
    )
    has_key = bool(_KEY.search(ordinary_key_text) or key_order_signal.search(ordinary_key_text)) or category == CATEGORY_KEY

    gate = details.get("gate_number") or "not collected"
    if has_repair:
        subject = f"[REPAIR] Gate {gate} — {job_ref}"
    elif has_key:
        subject = f"[KEY REQUEST] Alley-gate key enquiry {job_ref}"
    elif has_master_key:
        subject = f"[MASTER KEY APPLICATION] Restricted enquiry {job_ref}"
    else:
        subject = f"[CALL REVIEW] Chapelgate phone call {job_ref}"

    caller_detail_lines = [
        f"Caller name: {details.get('caller_name') or 'not collected'}",
        f"Callback number: {details.get('callback_number') or 'not collected'}",
        f"Caller address: {details.get('caller_address') or 'not collected'}",
    ]

    lines: list[str] = []

    if has_repair:
        lines.extend([
            "ALLEY GATE REPAIR JOB",
            "=====================",
            f"Job / reference: {job_ref}",
            f"Gate number: {gate}",
            f"Area: {details.get('area') or 'not collected'}",
            f"Fault reported: {details.get('fault_or_request') or 'not collected'}",
            f"Urgency: {details.get('urgency') or 'not collected'}",
            *caller_detail_lines,
            "",
        ])

    key_notes = [
        line for line in caller_lines
        if re.search(r"\bkeys?\b", line, re.IGNORECASE) and not _MASTER_KEY.search(line)
    ][:6]
    if has_key:
        existing_order = any(
            re.search(r"\b(?:already\s+ordered|ordered\s+(?:a|the)?\s*key|existing\s+order)\b", line, re.IGNORECASE)
            for line in caller_lines
        )
        lines.extend([
            "KEY ORDER / ENQUIRY",
            "===================",
            "KEY / RESIDENT KEY ENQUIRY",
            f"Job / reference: {job_ref}",
            f"Order status: {'Existing order mentioned' if existing_order else 'Key enquiry'}",
        ])
        if not has_repair:
            lines.extend(caller_detail_lines)
        lines.append("Caller notes:")
        lines.extend([f"- {line}" for line in key_notes] or ["- No additional key-order wording captured"])
        lines.append("")

    master_notes = [line for line in caller_lines if _MASTER_KEY.search(line)][:4]
    if has_master_key:
        lines.extend([
            "MASTER-KEY ENQUIRY",
            "==================",
            "RESTRICTED MASTER-KEY APPLICATION",
            f"Job / reference: {job_ref}",
            "Status: Application interest only - approval is not guaranteed.",
        ])
        if not has_repair and not has_key:
            lines.extend(caller_detail_lines)
        lines.append("Caller notes:")
        lines.extend([f"- {line}" for line in master_notes] or ["- Master-key interest detected"])
        lines.append("")

    if not (has_repair or has_key or has_master_key):
        lines.extend([
            "CALL REVIEW",
            "===========",
            f"Job / reference: {job_ref}",
            *caller_detail_lines,
            "",
        ])

    topics = []
    if has_repair:
        topics.append("Repair")
    if has_key:
        topics.append("Key order / enquiry")
    if has_master_key:
        topics.append("Master-key enquiry")

    lines.extend([
        "OTHER INFORMATION",
        "=================",
        f"Detected topics: {', '.join(topics) if topics else 'General call review'}",
        "",
        "Concise call summary:",
        details.get("summary") or "(empty)",
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
