"""Internal call-intake email notifications for Chapelgate voice sessions.

Persist the call/job first, then attempt email. Email failures must never
undo persistence. Duplicate Twilio stop/close callbacks are idempotent.
"""

from __future__ import annotations

import html
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


def _display_network_number(value: Any) -> str:
    """Return a safe display form for provider-supplied phone metadata."""
    raw = str(value or "").strip().replace("whatsapp:", "")
    if not raw:
        return ""
    if raw.casefold() in {"anonymous", "restricted", "unknown", "unavailable"}:
        return "withheld"
    compact = re.sub(r"[^\d+]", "", raw)
    if re.fullmatch(r"\+?\d{8,15}", compact):
        return compact
    return ""


def _fetch_twilio_call(call_sid: str, account_sid: str, auth_token: str):
    from twilio.rest import Client as TwilioClient
    return TwilioClient(account_sid, auth_token).calls(call_sid).fetch()


def call_numbers_for_call_sid(call_sid: str) -> dict[str, str]:
    """Read caller ANI and dialled number after the call, outside realtime voice."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    empty = {"caller_number": "", "called_number": ""}
    if not call_sid or not account_sid or not auth_token:
        return empty
    try:
        call = _fetch_twilio_call(call_sid, account_sid, auth_token)
        return {
            "caller_number": _display_network_number(getattr(call, "from_", "")),
            "called_number": _display_network_number(getattr(call, "to", "")),
        }
    except Exception as exc:
        operational_event(
            "voice_notification",
            transport="email",
            outcome="call_number_lookup_failed",
            reason_code=type(exc).__name__,
        )
        return empty


def called_number_for_call_sid(call_sid: str) -> str:
    """Compatibility wrapper for the Chapelgate destination number."""
    return call_numbers_for_call_sid(call_sid)["called_number"]


def caller_number_for_call_sid(call_sid: str) -> str:
    """Compatibility wrapper for provider-supplied caller ANI."""
    return call_numbers_for_call_sid(call_sid)["caller_number"]


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
    r"locks?\s+(?:fault|broken|jammed)|gate\s+(?:fault|broken|damaged)|"
    r"keys?\s+(?:doesn't|does\s+not|won't|will\s+not)\s+(?:fit|turn|work)|"
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
    r"[:\s]+(?:is\s+)?(\+?\d[\d\s()-]{7,}\d)",
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
    """Classify from caller-originated text only; assistant prompts are not facts."""
    text = "\n".join(_caller_lines(transcript))
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


def _readback_clearly_confirmed(transcript: str) -> bool:
    lines = [line.strip() for line in (transcript or "").splitlines() if line.strip()]
    confirmation_prompt = re.compile(
        r"\b(?:is\s+all\s+(?:of\s+)?(?:that|this)(?:\s+information)?\s+correct"
        r"|is\s+everything\s+(?:else\s+)?correct|is\s+that\s+correct)\b",
        re.IGNORECASE,
    )
    clear_yes = re.compile(
        r"^(?:yes|yeah|yep|correct|that's\s+right|that\s+is\s+right|that's\s+correct|that\s+is\s+correct)\b",
        re.IGNORECASE,
    )
    for idx, line in enumerate(lines[:-1]):
        if not line.casefold().startswith("assistant:") or not confirmation_prompt.search(line):
            continue
        # A bare field-specific correction such as "In Sefton, then. Is that
        # correct now?" confirms only that field. Global confirmation requires
        # a comprehensive read-back containing at least two structured fields.
        structured_markers = sum(
            bool(re.search(pattern, line, re.IGNORECASE))
            for pattern in (
                r"\bgate(?:\s+number)?\s+\d",
                r"\byour\s+name",
                r"\byour\s+(?:address|full\s+address)",
                r"\byour\s+(?:contact|phone|telephone)\s+number",
                r"\bjob\s+reference\b",
            )
        )
        confirms_everything_else = bool(re.search(
            r"\bis\s+everything\s+else\s+correct\b", line, re.IGNORECASE
        ))
        if structured_markers < 2 and not confirms_everything_else:
            continue
        for next_line in lines[idx + 1:]:
            if next_line.casefold().startswith("assistant:"):
                break
            if next_line.casefold().startswith("caller:"):
                reply = next_line.split(":", 1)[1].strip()
                if clear_yes.search(reply):
                    return True
                break
    return False


def _caller_key_order_intent_from_turn_context(transcript: str) -> bool:
    """Recognise caller intent only when replying to a specific key-order prompt."""
    previous_assistant = ""
    for raw in (transcript or "").splitlines():
        line = raw.strip()
        if line.casefold().startswith("assistant:"):
            previous_assistant = line.split(":", 1)[1].strip()
            continue
        if not line.casefold().startswith("caller:"):
            continue
        caller = line.split(":", 1)[1].strip()
        assistant_key_context = bool(re.search(
            r"\b(?:keys?|alleygates\.co\.uk|order\s+one|order\s+keys?|key\s+order|£\s*22)\b",
            previous_assistant,
            re.IGNORECASE,
        ))
        caller_order_intent = bool(re.search(
            r"\b(?:want\s+to\s+(?:order|buy)|want\s+one|order\s+(?:one|it)|"
            r"do\s+it\s+(?:on|over)\s+the\s+phone|on\s+the\s+phone|"
            r"also\s+want\s+to\s+order)\b",
            caller,
            re.IGNORECASE,
        ))
        if assistant_key_context and caller_order_intent:
            return True
    return False


def _structured_readback_unchallenged(transcript: str, readback_line: str) -> bool:
    """Allow a comprehensive 'just to confirm' readback only if caller moves on without correcting it."""
    if not readback_line or not re.search(
        r"\b(?:just\s+to\s+confirm|you(?:'ve|\s+have)\s+reported|the\s+problem\s+is)\b",
        readback_line,
        re.IGNORECASE,
    ):
        return False
    lines = [line.strip() for line in (transcript or "").splitlines() if line.strip()]
    target = f"Assistant: {readback_line}"
    try:
        idx = lines.index(target)
    except ValueError:
        return False
    for next_line in lines[idx + 1:]:
        if next_line.casefold().startswith("assistant:"):
            break
        if not next_line.casefold().startswith("caller:"):
            continue
        reply = next_line.split(":", 1)[1].strip()
        if re.search(
            r"\b(?:wrong|incorrect|mistake|not\s+correct|didn(?:'t|\s+not)\s+say|"
            r"you\s+got\s+.+\s+wrong)\b|^no\b",
            reply,
            re.IGNORECASE,
        ):
            return False
        return True
    return False


def _has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 for ch in value)


def extract_call_details(transcript: str, *, job_reference: str) -> dict[str, Any]:
    if not isinstance(transcript, str) or _has_control_chars(transcript):
        return {"gate": "", "area": "", "name": "", "callback": "", "address": "", "postcode": "", "fault": "", "sent": False}
    caller_lines = _caller_lines(transcript)
    assistant_lines = _assistant_lines(transcript)
    caller_text = "\n".join(caller_lines)
    assistant_text = "\n".join(assistant_lines)
    full = transcript or ""
    readback_confirmed = _readback_clearly_confirmed(full)

    gate_value = ""
    gate_words = {
        "one": "1", "two": "2", "three": "3", "four": "4", "five": "5",
        "six": "6", "seven": "7", "eight": "8", "nine": "9", "ten": "10",
    }
    last_assistant = ""
    for raw_line in (full or "").splitlines():
        line = raw_line.strip()
        if line.casefold().startswith("assistant:"):
            last_assistant = line.split(":", 1)[1].strip()
            continue
        if not line.casefold().startswith("caller:"):
            continue
        caller_line = line.split(":", 1)[1].strip()
        correction_prompt = bool(re.search(
            r"\bcorrect\s+gate\s+number\b|\bwhat(?:'s|\s+is)\s+the\s+correct\s+gate\s+number\b",
            last_assistant,
            re.IGNORECASE,
        ))
        if correction_prompt:
            gate_value = ""

        direct = _GATE_NUM.search(caller_line)
        if direct:
            gate_value = direct.group(1)
            continue

        # Real PSTN STT can distort "gate number" into a phonetically close
        # phrase (for example "geht's Nummer 1079"). Recover only when a
        # bounded gate/number anchor is present; never promote arbitrary digits.
        noisy_gate = re.search(
            r"\b(?:gate(?:'s|s)?|get(?:'s|s)?|gets|gait|geht(?:'s|s)?|kate)\s*"
            r"(?:(?:number|nummer|no\.?)\s*)?(\d{1,5})\b",
            caller_line,
            re.IGNORECASE,
        )
        if noisy_gate:
            gate_value = noisy_gate.group(1)
            continue

        bare = re.fullmatch(r"\D*(\d{1,5})\D*", caller_line)
        if bare and re.search(
            r"\bgate(?:\s+number)?\b|\bcorrect\s+gate\s+number\b",
            last_assistant,
            re.IGNORECASE,
        ):
            gate_value = bare.group(1)
            continue

        correction = re.search(
            r"\b(?:gate\s+)?(?:number|no\.?)\s+(one|two|three|four|five|six|seven|eight|nine|ten|\d{1,5})\b",
            caller_line,
            re.IGNORECASE,
        )
        correction_context = bool(
            re.search(
                r"\b(?:got|correct|wrong|actually|should\s+be)\b",
                caller_line,
                re.IGNORECASE,
            )
            or re.search(r"\bgate(?:\s+number)?\b", caller_line, re.IGNORECASE)
            or re.search(r"\bgate(?:\s+number)?\b", last_assistant, re.IGNORECASE)
        )
        if correction and correction_context:
            token = correction.group(1).casefold()
            gate_value = gate_words.get(token, token)

    if not gate_value and readback_confirmed:
        assistant_gate = _GATE_NUM.search(assistant_text)
        gate_value = assistant_gate.group(1) if assistant_gate else ""

    area_match = _AREA.search(caller_text)
    area_value = area_match.group(1) if area_match else ""
    if not area_value and readback_confirmed:
        confirmed_area = re.findall(
            r"\bgate\s+\d{1,5}\s+in\s+(Wirral|Sefton)\b",
            assistant_text,
            re.IGNORECASE,
        )
        area_value = confirmed_area[-1] if confirmed_area else ""

    confirmed_name = re.findall(
        r"\byour\s+name(?:'s|\s+is)\s+([^,\.\n]{2,80})",
        assistant_text,
        re.IGNORECASE,
    )
    name_wrong_idx = -1
    for idx, line in enumerate(caller_lines):
        if re.search(
            r"(?:\bname\b.{0,30}\b(?:wrong|incorrect)\b|\b(?:wrong|incorrect)\b.{0,30}\bname\b|\byou\s+got\s+my\s+name\s+wrong\b)",
            line,
            re.IGNORECASE,
        ):
            name_wrong_idx = idx

    def _name_candidate(line: str) -> str:
        explicit = re.search(
            r"\bmy\s+name\s+is\s+([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,3}?)(?=\s+(?:and\b|my\b)|[,.;\n]|$)",
            line,
        )
        if explicit:
            return explicit.group(1).strip()
        honorific = re.search(
            r"\b(?:Mr|Mrs|Ms|Miss|Dr)\s+([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,3})",
            line,
        )
        if honorific:
            return honorific.group(1).strip()
        candidate = line.strip(" ,.")
        if (
            re.fullmatch(r"[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,3}", candidate)
            and not any(ch.isdigit() for ch in candidate)
        ):
            return candidate
        leading = re.match(
            r"^\s*([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,2})\s+\d",
            line,
        )
        if leading:
            return leading.group(1).strip()
        return ""

    name_candidates = [
        candidate
        for idx, line in enumerate(caller_lines)
        if idx > name_wrong_idx
        for candidate in [_name_candidate(line)]
        if candidate
    ]
    if name_wrong_idx < 0:
        name_candidates = [
            candidate
            for line in caller_lines
            for candidate in [_name_candidate(line)]
            if candidate
        ]
    name_value = name_candidates[-1] if name_candidates else ""
    if not name_value and name_wrong_idx < 0:
        raw_name = _NAME.search(caller_text)
        if raw_name:
            name_value = raw_name.group(1).strip()
    if not name_value and name_wrong_idx < 0 and confirmed_name and readback_confirmed:
        name_value = confirmed_name[-1].strip()

    phone_wrong_idx = -1
    for idx, line in enumerate(caller_lines):
        if re.search(
            r"(?:\b(?:telephone|phone|contact)\b.{0,35}\b(?:wrong|incorrect)\b|\b(?:wrong|incorrect)\b.{0,35}\b(?:telephone|phone|contact)\b|\byou\s+got\s+(?:my\s+)?(?:telephone|phone|contact).*wrong\b)",
            line,
            re.IGNORECASE,
        ):
            phone_wrong_idx = idx

    caller_phone_candidates = []
    for idx, line in enumerate(caller_lines):
        if idx <= phone_wrong_idx:
            continue
        for match in re.finditer(r"(?<!\d)(\+?\d[\d\s()-]{7,}\d)(?!\d)", line):
            raw = match.group(1).strip()
            digits = re.sub(r"\D", "", raw)
            plausible_uk = (
                (digits.startswith("07") and len(digits) == 11)
                or (digits.startswith("0") and not digits.startswith("07") and len(digits) in {10, 11})
                or (digits.startswith("44") and len(digits) == 12)
            )
            if plausible_uk:
                caller_phone_candidates.append(raw)
    callback_value = (
        re.sub(r"\s+", " ", caller_phone_candidates[-1]).strip()
        if caller_phone_candidates
        else ""
    )

    # If raw STT drops a leading zero, accept the assistant's phone read-back
    # only when the caller clearly confirms the complete read-back. This keeps
    # unconfirmed/hallucinated assistant numbers fail-closed.
    if not callback_value and readback_confirmed:
        confirmed_phone_candidates = []
        confirmed_phone_pattern = re.compile(
            r"\b(?:your\s+)?(?:(?:contact|phone|telephone)\s+number|number)"
            r"\s+(?:is|was)\s+(\+?\d[\d\s()-]{7,}\d)",
            re.IGNORECASE,
        )
        for line in assistant_lines:
            for match in confirmed_phone_pattern.finditer(line):
                raw = match.group(1).strip()
                digits = re.sub(r"\D", "", raw)
                plausible_uk = (
                    (digits.startswith("07") and len(digits) == 11)
                    or (
                        digits.startswith("0")
                        and not digits.startswith("07")
                        and len(digits) in {10, 11}
                    )
                    or (digits.startswith("44") and len(digits) == 12)
                )
                if plausible_uk:
                    confirmed_phone_candidates.append(raw)
        if confirmed_phone_candidates:
            callback_value = re.sub(
                r"\s+", " ", confirmed_phone_candidates[-1]
            ).strip()

    confirmed_addresses = re.findall(
        r"\byour\s+address(?:'s|\s+is)\s+([^\.\n]{4,180})"
        r"|\b(?:you're|you\s+are)\s+at\s+([^\.\n]{4,180})"
        r"|\blocated\s+at\s+([^\.\n]{4,180})",
        assistant_text,
        re.IGNORECASE,
    )
    caller_address = ""
    street_pattern = re.compile(
        r"\b(\d{1,4}\s+[A-Za-z][A-Za-z' -]*\s+(?:Road|Street|Avenue|Way|Grove|Lane|Close|Drive|Court|Place|Crescent|Gardens|Park|Terrace|View|Walk|Rise|Square|Hill|Vale)\b.*?)(?=\s+(?:telephone|phone|contact|callback)\b|\s+and\s+the\s+gate\b|$)",
        re.IGNORECASE,
    )
    street_only_pattern = re.compile(
        r"\b([A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*){0,3}\s+"
        r"(?:Road|Street|Avenue|Way|Grove|Lane|Close|Drive|Court|Place|Crescent|Gardens|Park|Terrace|View|Rise|Square|Hill|Vale))\b"
    )
    for line in caller_lines:
        street = street_pattern.search(line)
        if street:
            caller_address = street.group(1).strip(" ,.")
            break
        # Alley-gate callers frequently give only the street name.
        street_only = street_only_pattern.search(line)
        if street_only:
            caller_address = street_only.group(1).strip(" ,.")
            break
        lowered = line.casefold()
        if any(k in lowered for k in ("my address", "i live at", "postcode")):
            caller_address = line.strip()
            break

    address = caller_address
    if readback_confirmed and confirmed_addresses:
        parts = confirmed_addresses[-1]
        confirmed_address = next((part.strip() for part in parts if part), "")
        if confirmed_address:
            address = confirmed_address

    postcode_source = f"{caller_address}\n{caller_text}"
    if readback_confirmed:
        postcode_source += f"\n{address}\n{assistant_text}"
    postcode_match = re.search(
        r"\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b",
        postcode_source,
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
            ).strip(" ,.")

    fault_patterns = [
        r"\b((?:the\s+)?keeper\s+(?:will\s+not|won't|doesn't|does\s+not|cannot|can't)\s+(?:go|fit|engage|latch)(?:\s+in)?)\b",
        r"\b((?:the\s+)?locks?\s+(?:missing|broken|damaged|jammed|stuck))\b",
        r"\b((?:the\s+)?key\s+(?:doesn't|does\s+not|won't|will\s+not)\s+(?:fit|turn|work)(?:\s+(?:in\s+)?(?:the\s+)?lock)?)\b",
        r"\bthe\s+problem\s+is\s+(.+?)(?:,\s*(?:at\s+)?gate\s+\d+|\.\s|$)",
        r"\breported\s+that\s+(.+?)(?:\s+on\s+gate\s+\d+|\.\s|$)",
        r"\bfault\s+is\s+(.+?)(?:,\s*(?:at\s+)?gate\s+\d+|\.\s|$)",
        r"\b((?:the\s+)?(?:locks?|gate|hinge|cylinder)(?:'s|\s+is)\s+(?:missing|broken|damaged|jammed|stuck)(?:\s+due\s+to\s+vandalism)?)",
        r"\b((?:the\s+)?keys?\s+(?:is|are)\s+spinning(?:\s+around)?)",
        r"\b(?:that's|that\s+is)\s+((?:a|an|the)\s+(?:damaged|broken|missing|jammed|stuck)\s+(?:locks?|gate|hinge|cylinder))(?:\s+on\s+gate\s+\d+)?",
    ]
    animal_fault = re.findall(
        r"\b((?:a|the|my)?\s*(?:dog|cat|pet|animal)\s+(?:is\s+)?(?:stuck|trapped|caught|wedged)\s+(?:in|inside|by|behind)\s+(?:the\s+)?gate)\b",
        caller_text,
        re.IGNORECASE,
    )
    fault = animal_fault[-1].strip(" ,.") if animal_fault else ""
    caller_lock_fault = re.findall(
        r"\b(?:the\s+)?gate\s+(?:has|has\s+got|is\s+got)\s+((?:a|an|the)\s+(?:damaged|broken|missing|jammed|stuck)\s+lock)\b",
        caller_text,
        re.IGNORECASE,
    )
    if not fault and caller_lock_fault:
        fault = caller_lock_fault[-1].strip(" ,.")
    if not fault:
        for pattern in fault_patterns:
            matches = re.findall(pattern, caller_text, re.IGNORECASE)
            if matches:
                fault = matches[-1].strip(" ,.")
                break
    if not fault:
        for line in caller_lines:
            simple = re.search(
                r"\b((?:the\s+)?(?:gate|locks?|hinge|cylinder|keys?)\s+(?:is|are|has|has\s+got)\s+.{0,50}?\b(?:damaged|broken|missing|jammed|stuck|spinning|vandali[sz])\w*\b[^.?!]*)",
                line,
                re.IGNORECASE,
            )
            if simple:
                fault = simple.group(1).strip(" ,.")
                break
    if not fault:
        caller_vandalism_fault = re.findall(
            r"\b((?:someone|they|he|she|the\s+neighbou?r|my\s+neighbou?r)?\s*"
            r"(?:keeps?\s+)?vandali[sz](?:ing|ed|es)?\s+(?:the\s+)?(?:lock|gate))\b",
            caller_text,
            re.IGNORECASE,
        )
        if caller_vandalism_fault:
            fault = caller_vandalism_fault[-1].strip(" ,.")
    if not fault:
        for line in caller_lines:
            if "problem" in line.casefold() or "issue" in line.casefold():
                fault = line.strip()
                break

    # A comprehensive end-of-call read-back is the voice layer's final
    # structured view of the call. Use it only to fill fields that raw STT
    # could not recover, and never for a field the caller subsequently
    # challenges. This is downstream parsing only; it does not alter voice.
    readback_line = next(
        (
            line for line in reversed(assistant_lines)
            if re.search(r"\bjob\s+reference\b", line, re.IGNORECASE)
            and re.search(r"\bgate\s+(?:number\s+)?\d{1,5}\b", line, re.IGNORECASE)
            and re.search(r"\byour\s+name", line, re.IGNORECASE)
        ),
        "",
    )
    scoped_correction_engaged = bool(re.search(
        r"Assistant:.*?\b(?:my\s+mistake|correction)\b.*?\b(?:Wirral|Sefton)\b.*?"
        r"(?:is\s+that\s+correct|correct\s+now).*?\nCaller:\s*(?:yes|yeah|yep|correct)\b",
        full,
        re.IGNORECASE,
    ))
    readback_accepted_context = readback_confirmed or scoped_correction_engaged
    fault_readback_context = (
        readback_accepted_context
        or _structured_readback_unchallenged(full, readback_line)
    )

    if readback_line and readback_accepted_context:
        readback_gate = re.search(
            r"\bgate(?:\s+number)?\s+(\d{1,5})\b", readback_line, re.IGNORECASE
        )
        if not gate_value and readback_gate:
            gate_value = readback_gate.group(1)

        readback_name = re.search(
            r"\byour\s+name(?:'s|\s+is)\s+([^,\.]+)", readback_line, re.IGNORECASE
        )
        if not name_value and name_wrong_idx < 0 and readback_name:
            name_value = readback_name.group(1).strip()

        readback_address = re.search(
            r"\byour\s+address(?:'s|\s+is)\s+(.+?)(?=,?\s+and\s+your\s+(?:contact|phone|telephone)\s+number\b)",
            readback_line,
            re.IGNORECASE,
        )
        if readback_address:
            candidate_address = readback_address.group(1).strip(" ,.")
            candidate_postcode = re.search(
                r"\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b",
                candidate_address,
                re.IGNORECASE,
            )
            if candidate_postcode:
                compact = re.sub(r"\s+", "", candidate_postcode.group(1)).upper()
                readback_postcode = compact[:-3] + " " + compact[-3:]
                if not postcode:
                    postcode = readback_postcode
                candidate_address = re.sub(
                    re.escape(candidate_postcode.group(1)),
                    "",
                    candidate_address,
                    flags=re.IGNORECASE,
                ).strip(" ,.")
            # Prefer the bounded read-back address when the earlier parser
            # accidentally swallowed the following contact-number clause.
            if not address or re.search(
                r"\b(?:contact|phone|telephone)\s+number\b", address, re.IGNORECASE
            ):
                address = candidate_address

        if not callback_value and phone_wrong_idx < 0:
            readback_phone = re.search(
                r"\byour\s+(?:contact|phone|telephone)\s+number\s+(?:is|was)\s+(\+?\d[\d\s()-]{7,}\d)",
                readback_line,
                re.IGNORECASE,
            )
            if readback_phone:
                raw = readback_phone.group(1).strip()
                digits = re.sub(r"\D", "", raw)
                if (
                    (digits.startswith("07") and len(digits) == 11)
                    or (digits.startswith("0") and not digits.startswith("07") and len(digits) in {10, 11})
                    or (digits.startswith("44") and len(digits) == 12)
                ):
                    callback_value = re.sub(r"\s+", " ", raw).strip()


    if readback_line and fault_readback_context:
            readback_fault = re.search(
                r"\bgate(?:\s+number)?\s+\d{1,5},?\s+and\s+(?:it(?:'s|\s+is)|the\s+gate\s+is)\s+([^,.]+)",
                readback_line,
                re.IGNORECASE,
            )
            if not readback_fault:
                readback_fault = re.search(
                    r"\bgate(?:\s+number)?\s+\d{1,5}\s+and\s+((?:the\s+)?keys?\s+(?:is|are)\s+spinning(?:\s+around)?)",
                    readback_line,
                    re.IGNORECASE,
                )
            if not readback_fault:
                readback_fault = re.search(
                    r"\bgate(?:\s+number)?\s+\d{1,5},?\s+that\s+it(?:'s|\s+is)\s+([^,.]+)",
                    readback_line,
                    re.IGNORECASE,
                )
            if not readback_fault:
                readback_fault = re.search(
                    r"\bthe\s+problem\s+is\s+(.+?)(?:,\s*(?:at\s+)?gate\s+\d{1,5}\b)",
                    readback_line,
                    re.IGNORECASE,
                )
            if not readback_fault:
                readback_fault = re.search(
                    r"\breport(?:ing|ed)\s+(.+?)\s+on\s+(?:alley\s+)?gate\s+\d{1,5}\b",
                    readback_line,
                    re.IGNORECASE,
                )
            if readback_fault and (
                not fault
                or re.match(r"^So,\s*just\s+to\s+confirm\b", fault, re.IGNORECASE)
                or re.search(r"\bvandali[sz]\w*\b", fault, re.IGNORECASE)
            ):
                fault = readback_fault.group(1).strip(" ,.")

    # A later, explicitly confirmed area correction is scoped to area only.
    # It must not retroactively confirm or invalidate unrelated read-back fields.
    transcript_lines = [line.strip() for line in full.splitlines() if line.strip()]
    for idx, line in enumerate(transcript_lines[:-1]):
        if not line.casefold().startswith("assistant:"):
            continue
        scoped_area = re.search(
            r"\b(?:in\s+)?(Wirral|Sefton),?\s+(?:then\b|is\s+that\s+correct|correct\b)",
            line,
            re.IGNORECASE,
        )
        if not scoped_area:
            continue
        next_line = transcript_lines[idx + 1]
        if next_line.casefold().startswith("caller:") and re.search(
            r"^caller:\s*(?:yes|yeah|yep|correct|that's\s+right)\b",
            next_line,
            re.IGNORECASE,
        ):
            area_value = scoped_area.group(1)

    urgency = _URGENCY.search(caller_text)
    animal_emergency = bool(animal_fault)
    open_gate = bool(re.search(
        r"\b(?:the\s+)?gates?\s+(?:is|are|remains?|stays?)\s+(?:still\s+)?open\b"
        r"|\b(?:the\s+)?gates?\s+still\s+open\b",
        caller_text,
        re.IGNORECASE,
    ))
    category = classify_call_category(full)
    if fault or open_gate:
        category = CATEGORY_REPAIR

    return {
        "category": category,
        "caller_name": name_value,
        "callback_number": callback_value,
        "caller_address": address,
        "postcode": postcode,
        "area": area_value,
        "gate_number": gate_value,
        "fault_or_request": fault,
        "reported_condition": "Gate remains open" if open_gate else "",
        "urgency": "emergency - animal trapped" if animal_emergency else (urgency.group(1) if urgency else ""),
        "job_reference": job_reference,
        "transcript": full.strip()[:6000],
    }


def _number_digits(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if digits.startswith("44") and len(digits) in {11, 12}:
        return "0" + digits[2:]
    return digits


def report_quality_warnings(details: dict[str, Any]) -> list[str]:
    """Deterministic post-call diagnostics; never invent missing caller data."""
    warnings: list[str] = []
    category = details.get("category") or ""
    caller_number = str(details.get("caller_number") or "")
    callback_number = str(details.get("callback_number") or "")

    usable_caller_number = bool(caller_number and caller_number != "withheld")
    if caller_number == "withheld":
        warnings.append("Network caller number was withheld.")
    elif not caller_number:
        warnings.append("Network caller number was unavailable from the phone provider.")
    if not callback_number:
        if usable_caller_number:
            warnings.append("Spoken callback number was not reliably collected; use the network caller number only if operationally appropriate.")
        else:
            warnings.append("No reliable callback number was collected.")
    elif usable_caller_number:
        ani_digits = _number_digits(caller_number)
        callback_digits = _number_digits(callback_number)
        if ani_digits and callback_digits and ani_digits != callback_digits:
            warnings.append("Network caller number differs from the spoken callback number.")

    if category == CATEGORY_REPAIR:
        required = (
            ("gate_number", "Gate number"),
            ("fault_or_request", "Fault details"),
            ("caller_name", "Caller name"),
            ("caller_address", "Caller address"),
            ("postcode", "Postcode"),
            ("area", "Area"),
        )
        for key, label in required:
            if not details.get(key):
                warnings.append(f"{label} was not reliably collected.")

    return warnings


def report_requires_review(details: dict[str, Any]) -> bool:
    """Return True when operations should inspect the call before acting."""
    category = details.get("category") or ""
    caller_number = str(details.get("caller_number") or "")
    callback_number = str(details.get("callback_number") or "")
    usable_caller_number = bool(caller_number and caller_number != "withheld")

    if category in {"", CATEGORY_CALL_REVIEW}:
        return True
    if not callback_number:
        # Caller ID is useful context but is not a confirmed preferred callback.
        return True
    if usable_caller_number:
        ani_digits = _number_digits(caller_number)
        callback_digits = _number_digits(callback_number)
        if ani_digits and callback_digits and ani_digits != callback_digits:
            return True
    if category == CATEGORY_REPAIR:
        for key in ("gate_number", "fault_or_request", "caller_name", "caller_address", "postcode", "area"):
            if not details.get(key):
                return True
    return False


def _email_sections(body: str) -> list[tuple[str, list[str]]]:
    """Parse the deterministic plain-text report into titled sections."""
    rows = (body or "").splitlines()
    sections: list[tuple[str, list[str]]] = []
    idx = 0
    while idx < len(rows):
        title = rows[idx].strip()
        next_line = rows[idx + 1].strip() if idx + 1 < len(rows) else ""
        if title and next_line and set(next_line) == {"="}:
            idx += 2
            content: list[str] = []
            while idx < len(rows):
                possible = rows[idx].strip()
                underline = rows[idx + 1].strip() if idx + 1 < len(rows) else ""
                if possible and underline and set(underline) == {"="}:
                    break
                content.append(rows[idx])
                idx += 1
            while content and not content[-1].strip():
                content.pop()
            sections.append((title, content))
            continue
        idx += 1
    return sections


def build_internal_email_html(subject: str, body: str) -> str:
    """Render the text report as an accessible, scan-first operational job card."""
    sections = _email_sections(body)
    open_gate = "Reported Condition: Gate remains open" in (body or "")
    review_required = "REVIEW BEFORE DISPATCH" in (body or "")
    if open_gate:
        accent = "#b42318"
        banner_bg = "#fef3f2"
        banner_text = "#912018"
        status = "OPEN GATE - ATTENTION"
    elif review_required:
        accent = "#b54708"
        banner_bg = "#fffaeb"
        banner_text = "#7a2e0e"
        status = "REVIEW REQUIRED"
    else:
        accent = "#067647"
        banner_bg = "#ecfdf3"
        banner_text = "#05603a"
        status = "READY"

    parts = [
        "<!doctype html>",
        '<html lang="en" dir="ltr">',
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width,initial-scale=1">',
        f"<title>{html.escape(subject)}</title>",
        "</head>",
        '<body style="margin:0;padding:0;background:#f3f4f6;color:#182230;font-family:Arial,Helvetica,sans-serif;line-height:1.45;">',
        '<div lang="en" dir="ltr" style="display:none;max-height:0;overflow:hidden;color:transparent;">'
        + html.escape(subject)
        + "</div>",
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;">',
        '<tr><td align="center" style="padding:24px 12px;">',
        '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background:#ffffff;border:1px solid #e4e7ec;border-radius:14px;overflow:hidden;">',
        f'<tr><td style="padding:20px 24px 14px;border-top:5px solid {accent};">',
        '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#475467;text-transform:uppercase;margin-bottom:7px;">Chapelgate · Call report</div>',
        f'<h1 style="font-size:23px;line-height:1.25;margin:0;color:#101828;">{html.escape(subject)}</h1>',
        "</td></tr>",
        f'<tr><td style="padding:0 24px 16px;"><div style="background:{banner_bg};color:{banner_text};border-radius:9px;padding:11px 13px;font-size:13px;font-weight:700;">{html.escape(status)}</div></td></tr>',
    ]

    for title, rows in sections:
        if title == "ACTION":
            continue
        transcript = title.startswith("FULL TRANSCRIPT")
        muted = title in {"CALL METADATA", "FULL TRANSCRIPT - AUDIT ONLY"}
        bg = "#f9fafb" if muted else "#ffffff"
        parts.append(
            f'<tr><td style="padding:0 24px 14px;"><section style="background:{bg};'
            'border:1px solid #eaecf0;border-radius:10px;padding:15px 16px;">'
        )
        parts.append(
            '<h2 style="font-size:12px;line-height:1.3;letter-spacing:.06em;text-transform:uppercase;'
            'color:#475467;margin:0 0 10px;">'
            + html.escape(title)
            + "</h2>"
        )
        if transcript:
            transcript_text = "\n".join(rows).strip()
            parts.append(
                '<pre style="margin:0;white-space:pre-wrap;word-wrap:break-word;'
                'font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;'
                'color:#667085;background:transparent;border:0;">'
                + html.escape(transcript_text)
                + "</pre>"
            )
        else:
            in_list = False
            for raw in rows:
                line = raw.strip()
                if not line:
                    continue
                if line.startswith("- "):
                    if not in_list:
                        parts.append('<ul style="margin:4px 0 0;padding-left:20px;color:#344054;">')
                        in_list = True
                    parts.append(f'<li style="margin:4px 0;">{html.escape(line[2:])}</li>')
                    continue
                if in_list:
                    parts.append("</ul>")
                    in_list = False
                if ": " in line:
                    label, value = line.split(": ", 1)
                    parts.append(
                        '<p style="margin:5px 0;font-size:14px;color:#344054;"><strong style="color:#101828;">'
                        + html.escape(label)
                        + ":</strong> "
                        + html.escape(value)
                        + "</p>"
                    )
                else:
                    parts.append(f'<p style="margin:5px 0;font-size:14px;color:#344054;">{html.escape(line)}</p>')
            if in_list:
                parts.append("</ul>")
        parts.append("</section></td></tr>")

    parts.extend([
        '<tr><td style="padding:4px 24px 22px;"><p style="margin:0;font-size:11px;line-height:1.4;color:#98a2b3;">'
        'Structured fields are intended for operations. The transcript is retained only for audit because speech recognition can contain errors.'
        '</p></td></tr>',
        "</table></td></tr></table>",
        "</body></html>",
    ])
    return "\n".join(parts)


def _subject_location(address: str) -> str:
    """Keep the inbox subject compact without changing stored address evidence."""
    first = (address or "").split(",", 1)[0].strip()
    match = re.match(
        r"^(.{1,80}?\b(?:Road|Street|Avenue|Way|Grove|Lane|Close|Drive|Court|Place|"
        r"Crescent|Gardens|Park|Terrace|View|Rise|Square|Hill|Vale)\b)",
        first,
        re.IGNORECASE,
    )
    return (match.group(1).strip() if match else first)[:60]


def _operational_next_step(details: dict[str, Any], *, review_required: bool) -> str:
    """Return a bounded operational suggestion; never claim action already happened."""
    fault = str(details.get("fault_or_request") or "").casefold()
    condition = str(details.get("reported_condition") or "").casefold()
    if review_required and "open" in condition:
        return "Confirm the flagged fields, then allocate repair to secure the open gate."
    if review_required:
        return "Confirm the flagged fields before dispatch."
    if "keeper" in fault:
        return "Allocate repair to inspect the keeper/alignment and secure the gate."
    if "lock" in fault:
        return "Allocate repair to inspect the lock/closing mechanism and secure the gate."
    if "open" in condition:
        return "Allocate repair and secure the gate."
    return "Allocate the repair for inspection."


def build_internal_email(details: dict[str, Any]) -> tuple[str, str]:
    category = details.get("category") or "unknown"
    job_ref = details.get("job_reference") or "unknown"
    transcript = details.get("transcript") or ""
    caller_lines = _caller_lines(transcript)
    caller_text = "\n".join(caller_lines)
    full = transcript

    has_repair = (
        bool(details.get("fault_or_request") or details.get("reported_condition"))
        or bool(_REPAIR.search(caller_text))
    )
    has_master_key = bool(_MASTER_KEY.search(caller_text)) or category == CATEGORY_MASTER_KEY

    ordinary_key_text = _MASTER_KEY.sub("", caller_text)
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
    contextual_key_intent = _caller_key_order_intent_from_turn_context(full)
    has_key = (
        bool(_KEY.search(ordinary_key_text) or key_order_signal.search(ordinary_key_text))
        or contextual_key_intent
        or category == CATEGORY_KEY
    )

    gate = str(details.get("gate_number") or "")
    address = str(details.get("caller_address") or "")
    condition = str(details.get("reported_condition") or "")
    quality_warnings = report_quality_warnings(details)
    review_required = report_requires_review(details)

    if has_repair:
        repair_label = (
            "[REPAIR][OPEN GATE]"
            if condition.casefold() == "gate remains open"
            else "[REPAIR]"
        )
        gate_label = f"Gate {gate}" if gate else "Gate details incomplete"
        subject = f"{repair_label} {gate_label}"
        if address:
            subject += f" | {_subject_location(address)}"
        subject += f" | {job_ref}"
    elif has_key:
        subject = f"[KEY REQUEST] Alley-gate key enquiry | {job_ref}"
    elif has_master_key:
        subject = f"[MASTER KEY APPLICATION] Restricted enquiry | {job_ref}"
    else:
        subject = f"[CALL REVIEW] Chapelgate phone call | {job_ref}"

    lines: list[str] = [
        "ACTION",
        "======",
        "REVIEW BEFORE DISPATCH" if review_required else "READY FOR DISPATCH",
    ]
    if condition:
        lines.append(f"Reported condition: {condition}.")
    if has_repair:
        lines.append(f"Next step: {_operational_next_step(details, review_required=review_required)}")
    lines.append("")

    if has_repair:
        lines.extend([
            "JOB SUMMARY - Chapelgate Alleygate Repair Call Report",
            "=====================================================",
            f"Job ID: {job_ref}",
        ])
        if gate:
            lines.append(f"Gate Number: {gate}")
        if address:
            lines.append(f"Address: {address}")
        if details.get("postcode"):
            lines.append(f"Postcode: {details['postcode']}")
        if details.get("area"):
            lines.append(f"Area: {details['area']}")
        if details.get("fault_or_request"):
            lines.append(f"Fault Details: {details['fault_or_request']}")
        if condition:
            lines.append(f"Reported Condition: {condition}")
        if details.get("urgency"):
            lines.append(f"Urgency: {details['urgency']}")
        lines.append("")

    person_label = "Resident Name" if has_repair else "Name"
    lines.extend(["CALLER DETAILS", "=============="])
    if details.get("caller_name"):
        lines.append(f"{person_label}: {details['caller_name']}")
    if details.get("caller_number"):
        lines.append(
            f"Caller Number: {details['caller_number']} "
            "(network caller ID; not identity-verified)"
        )
    if details.get("callback_number"):
        lines.append(f"Contact Number: {details['callback_number']} (spoken callback)")
    lines.append("")

    if not has_repair and any(
        details.get(key) for key in ("caller_address", "postcode", "area", "gate_number")
    ):
        lines.extend(["LOCATION / GATE", "==============="])
        if address:
            lines.append(f"Address: {address}")
        if details.get("postcode"):
            lines.append(f"Postcode: {details['postcode']}")
        if details.get("area"):
            lines.append(f"Area: {details['area']}")
        if gate:
            lines.append(f"Gate Number: {gate}")
        lines.append("")

    if quality_warnings or review_required:
        lines.extend([
            "NEEDS CONFIRMATION / DATA QUALITY",
            "=================================",
            f"Manual Review Required: {'YES' if review_required else 'NO'}",
            *[f"- {warning}" for warning in quality_warnings],
            "",
        ])

    existing_order = bool(re.search(
        r"(?:already\s+ordered|confirmation\s+email.*order\s+number|reply\s+to\s+that\s+email|royal\s+mail|tracking\s+(?:info|information))",
        caller_text,
        re.IGNORECASE | re.DOTALL,
    ))
    new_key_order = bool(re.search(
        r"(?:order.*online.*alleygates\.co\.uk|keys?\s+are\s+currently\s+(?:£\s*)?22|key\s+orders?\s+are\s+placed)",
        caller_text,
        re.IGNORECASE | re.DOTALL,
    )) or contextual_key_intent
    if has_key:
        phone_order_requested = bool(re.search(
            r"\b(?:on|over)\s+the\s+phone\b|\bdo\s+it\s+on\s+the\s+phone\b",
            caller_text,
            re.IGNORECASE,
        ))
        lines.extend(["KEY ORDER / ENQUIRY", "==================="])
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

    lines.extend(["OTHER INFORMATION", "================="])
    if other_notes:
        lines.extend([f"- {line}" for line in other_notes])
    else:
        lines.append("- No additional operational information captured.")
    lines.append("")

    lines.extend(["CALL METADATA", "============="])
    if details.get("called_number"):
        lines.append(f"Number Called: {details['called_number']} (Chapelgate line)")
    if details.get("provider_call_id"):
        lines.append(
            f"Provider Call ID: {details['provider_call_id']} (Twilio CallSid)"
        )
    if details.get("call_started_at"):
        lines.append(f"Call Started: {details['call_started_at']}")
    lines.append("")

    lines.extend([
        "FULL TRANSCRIPT - AUDIT ONLY",
        "============================",
        "Raw machine transcription may contain recognition errors; use the structured fields above for operations.",
        "",
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
            # Phone-network metadata is fetched after the call from Twilio using
            # the persisted CallSid. It is never placed on the realtime voice path.
            details.update(call_numbers_for_call_sid(cs.call_sid))
            # CallSid is Twilio's unique call-resource identifier. Keep it in the
            # internal report so database/snapshot rollback cannot make two calls
            # operationally indistinguishable when a local numeric ID is reused.
            details["provider_call_id"] = cs.call_sid
            if cs.started_at:
                started = cs.started_at.isoformat(timespec="seconds")
                details["call_started_at"] = (
                    f"{started}Z" if cs.started_at.tzinfo is None else started
                )
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
            # Resend idempotency protects the provider boundary as well as the
            # existing database action claim, so a timeout/retry cannot duplicate
            # the same logical call report within the provider's retention window.
            html_body = build_internal_email_html(subject, body)
            provider_idempotency_key = f"maintenanceos-call-report/{cs.call_sid}"
            send_result = send_email(
                recipient,
                subject,
                body,
                html_body=html_body,
                idempotency_key=provider_idempotency_key,
                allow_smtp_fallback=False,
            )
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
