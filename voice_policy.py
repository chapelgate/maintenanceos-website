import re

from action_evidence import confirmed_actions
from idempotency import ai_side_effects_enabled, claim_action
from models import WorkOrder
from safety_controls import critical_safety_active


PROHIBITED_ACTION_TERMS = {
    "payment", "pay", "refund", "compensation", "fee_waiver", "waive_fee",
    "client_money", "credit_account", "issue_credit",
}
CONSEQUENTIAL_ACTIONS = {
    "cancel", "close", "mark_safe", "routine_dispatch", "dispatch", "book",
    "approve_quote", "approve_invoice", "complete",
}
SAFE_MODEL_ACTIONS = {"record_intake", "request_human_transfer", "add_transcript"}
FALSE_FINANCIAL_CONFIRMATION = re.compile(
    r"\b(?:payment|refund|compensation|fee|fees|credit|client money)\b"
    r".{0,45}\b(?:paid|processed|issued|approved|waived|credited|arranged|completed)\b"
    r"|\b(?:paid|processed|issued|approved|waived|credited|arranged|completed)\b"
    r".{0,45}\b(?:payment|refund|compensation|fee|fees|credit|client money)\b",
    re.IGNORECASE,
)
FINANCIAL_TOPIC = re.compile(r"\b(?:payment|refund|compensation|fee|fees|credit|client money|rent reduction)\b",re.IGNORECASE)
FINANCIAL_DENIAL = re.compile(r"\b(?:cannot|can't|unable|not able|no authority|do not have authority|won't|will not)\b",re.IGNORECASE)
CRITICAL_DOWNGRADE = re.compile(
    r"\b(?:safe|probably fine|routine|cancel(?:led)?|clos(?:e|ed)|resolved|"
    r"dispatch(?:ed)?|book(?:ed)?|completed?)\b",
    re.IGNORECASE,
)
PARTY = (
    r"contractor|engineer|plumber|electrician|operative|emergency services|emergency service|"
    r"national gas(?: emergency service)?|gas emergency (?:service|line|team)|gas board|gas network|"
    r"fire brigade|fire service|police|ambulance|999|human operator|human|"
    r"operator|manager|landlord|council|agent|property manager|maintenance team|"
    r"housing officer"
)
SUCCESS_VERB = (
    r"contacted|called|notified|alerted|informed|dispatched|sent|booked|assigned|"
    r"arranged|organised|scheduled|engaged|instructed|mobilised"
)
ACTIVE_ACTION_CLAIM = re.compile(
    rf"\b(?:i|we|i've|we've|the system|our team)\s+"
    rf"(?:have\s+|has\s+|already\s+)?(?P<verb>{SUCCESS_VERB})\s+"
    rf"(?:for\s+)?(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\b",
    re.IGNORECASE,
)
PASSIVE_ACTION_CLAIM = re.compile(
    rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+"
    rf"(?:has|have|was|were|is|are)\s+(?:already\s+)?(?:been\s+)?"
    rf"(?P<verb>{SUCCESS_VERB})\b",
    re.IGNORECASE,
)
CHAINED_ACTION_CLAIM = re.compile(
    rf"\b(?:and|then)\s+(?:have\s+|already\s+)?(?P<verb>{SUCCESS_VERB})\s+"
    rf"(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\b",
    re.IGNORECASE,
)
APPOINTMENT_CLAIM = re.compile(
    r"\b(?:the|your|an?)\s+(?:appointment|visit|slot)\s+"
    r"(?:has|have|was|is)\s+(?:already\s+)?(?:been\s+)?(?:booked|confirmed|arranged)\b",
    re.IGNORECASE,
)
ON_THE_WAY_CLAIM = re.compile(
    rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+"
    rf"(?:is|are)\s+(?:already\s+)?on\s+(?:the|their)\s+way\b",
    re.IGNORECASE,
)
COMING_CLAIM = re.compile(
    rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+"
    rf"(?:is|are|will be|'s)\s+(?:already\s+)?(?:coming|attending|en route|on\s+(?:the|their)\s+way)\b",
    re.IGNORECASE,
)
REFERRAL_CLAIM = re.compile(
    rf"\b(?:i|we|i've|we've)\s+(?:have\s+|already\s+)?"
    rf"(?:passed|reported|referred|escalated)\s+(?:this|it|the\s+(?:issue|case|repair))\s+to\s+"
    rf"(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\b",
    re.IGNORECASE,
)
PARTY_AWARE_CLAIM = re.compile(
    rf"\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<party>{PARTY})\s+"
    rf"(?:knows|know)\s+(?:already\s+)?about\s+(?:this|it|the\s+(?:issue|case|repair))\b"
    rf"|\b(?:a\s+|an\s+|the\s+|your\s+)?(?P<informed_party>{PARTY})\s+"
    rf"(?:has|have)\s+(?:already\s+)?been\s+(?:told|informed|notified|alerted)\b",
    re.IGNORECASE,
)
NON_CONFIRMING_CONTEXT = re.compile(
    r"\b(?:cannot|can't|unable to|not able to|do not|don't|could not|couldn't)\s+"
    r"(?:confirm|verify|say|contact|dispatch|book|notify|transfer|complete)\b"
    r"|\b(?:no confirmation|no evidence|not yet|unconfirmed|unknown whether|still pending|"
    r"awaiting confirmation|requested but|attempted but|tried to)\b",
    re.IGNORECASE,
)
TRANSFER_CLAIM = re.compile(
    r"\b(?:i|we|i've|we've|the system|our team)\s+(?:have\s+|has\s+|already\s+)?"
    r"(?:transferred|connected|put)\s+you\s+(?:through|to)\b"
    r"|\byou(?:'re| are)\s+(?:now\s+)?(?:connected|through)\s+to\b",
    re.IGNORECASE,
)
COMPLETION_CLAIM = re.compile(
    r"\b(?:the|your)\s+(?:repair|job|work|issue|case)\s+"
    r"(?:has|have|was|is)\s+(?:already\s+)?(?:been\s+)?"
    r"(?:completed|finished|fixed|resolved|closed)\b"
    r"|\b(?:i|we|i've|we've)\s+(?:have\s+|already\s+)?"
    r"(?:completed|finished|fixed|resolved|closed)\s+(?:the|your)\s+(?:repair|job|work|issue|case)\b",
    re.IGNORECASE,
)
CANCELLATION_CLAIM = re.compile(
    r"\b(?:the|your)\s+(?:appointment|booking|visit|slot)\s+"
    r"(?:has|have|was|is)\s+(?:already\s+)?(?:been\s+)?cancelled\b"
    r"|\b(?:i|we|i've|we've)\s+(?:have\s+|already\s+)?cancelled\s+"
    r"(?:the|your)\s+(?:appointment|booking|visit|slot)\b",
    re.IGNORECASE,
)
PRIVATE_DISCLOSURE = re.compile(
    r"\b(?:your|the resident(?:'s)?|the tenant(?:'s)?|the property(?:'s)?)\s+"
    r"(?:full\s+)?(?:address|postcode|access code|door code|key[- ]?safe code|"
    r"account number|tenancy details?|repair history)\s+(?:is|are|was|were)\b"
    r"|\b(?:our records|the account|the tenancy)\s+(?:show|shows|says|confirm|confirms)\b",
    re.IGNORECASE,
)


def _action_for_claim(party: str, verb: str) -> str:
    party = party.lower()
    verb = verb.lower()
    if party in {"emergency services", "emergency service", "fire brigade", "fire service", "police", "ambulance", "999"} or re.fullmatch(
        r"national gas(?: emergency service)?|gas emergency (?:service|line|team)|gas board|gas network", party
    ):
        return "emergency_services_dispatched" if verb in {"dispatched", "sent", "assigned", "mobilised"} else "emergency_services_contacted"
    if party in {"human operator", "human", "operator", "manager"}:
        return "human_operator_contacted"
    if party in {"contractor", "engineer", "plumber", "electrician", "operative"}:
        if verb == "booked":
            return "appointment_booked"
        if verb in {"dispatched", "sent", "assigned", "arranged", "organised", "scheduled", "engaged", "instructed", "mobilised"}:
            return "contractor_dispatched"
        return "contractor_contacted"
    return "other_party_notified"


def _sentence_for_match(text: str, start: int, end: int) -> str:
    left = max(text.rfind(".", 0, start), text.rfind("!", 0, start), text.rfind("?", 0, start)) + 1
    candidates = [position for mark in ".!?" if (position := text.find(mark, end)) >= 0]
    right = min(candidates) + 1 if candidates else len(text)
    return text[left:right].strip()


def _nonaffirmative(text: str, start: int, end: int) -> bool:
    sentence = _sentence_for_match(text, start, end)
    return sentence.endswith("?") or bool(NON_CONFIRMING_CONTEXT.search(sentence))


def detect_action_claims(text: str) -> set[str]:
    text = text or ""
    claims = set()
    for pattern in (ACTIVE_ACTION_CLAIM, PASSIVE_ACTION_CLAIM, CHAINED_ACTION_CLAIM):
        for match in pattern.finditer(text):
            if _nonaffirmative(text, match.start(), match.end()):
                continue
            verb = match.groupdict().get("verb") or "contacted"
            claims.add(_action_for_claim(match.group("party"), verb))
    for pattern, verb in (
        (ON_THE_WAY_CLAIM, "dispatched"),
        (COMING_CLAIM, "dispatched"),
        (REFERRAL_CLAIM, "notified"),
        (PARTY_AWARE_CLAIM, "notified"),
    ):
        for match in pattern.finditer(text):
            if not _nonaffirmative(text, match.start(), match.end()):
                party = match.groupdict().get("party") or match.groupdict().get("informed_party")
                claims.add(_action_for_claim(party, verb))
    for match in APPOINTMENT_CLAIM.finditer(text):
        if not _nonaffirmative(text, match.start(), match.end()):
            claims.add("appointment_booked")
    for pattern, action in (
        (TRANSFER_CLAIM, "human_transfer_connected"),
        (COMPLETION_CLAIM, "repair_completed"),
        (CANCELLATION_CLAIM, "appointment_cancelled"),
    ):
        for match in pattern.finditer(text):
            if not _nonaffirmative(text, match.start(), match.end()):
                claims.add(action)
    return claims


def verified_actions_for_work_order(session, work_order_id: int | None) -> set[str]:
    return confirmed_actions(session, work_order_id)


def detect_private_disclosure(text: str, private_markers=()) -> bool:
    text = text or ""
    if PRIVATE_DISCLOSURE.search(text):
        return True
    lowered = text.casefold()
    return any(
        len(marker.strip()) >= 4 and marker.strip().casefold() in lowered
        for marker in private_markers or ()
        if isinstance(marker, str)
    )


def validate_assistant_text(
    text: str,
    *,
    critical_active: bool,
    verified_actions: set[str] | None = None,
    identity_verified: bool = False,
    private_markers=(),
) -> tuple[bool, str]:
    text = text or ""
    if FALSE_FINANCIAL_CONFIRMATION.search(text) or (FINANCIAL_TOPIC.search(text) and not FINANCIAL_DENIAL.search(text)):
        return False, "prohibited_financial_confirmation"
    if not identity_verified and detect_private_disclosure(text, private_markers):
        return False, "unverified_private_disclosure"
    if critical_active and CRITICAL_DOWNGRADE.search(text):
        return False, "critical_safety_conflict"
    unverified_claims = detect_action_claims(text) - set(verified_actions or ())
    if unverified_claims:
        return False, "unverified_action_confirmation:" + ",".join(sorted(unverified_claims))
    return True, ""


def authorize_model_action(
    session,
    work_order_id: int | None,
    action: str,
    call_key: str,
    *,
    client_id: int | None = None,
):
    action = (action or "").strip().lower()
    if action in PROHIBITED_ACTION_TERMS or any(term in action for term in PROHIBITED_ACTION_TERMS):
        return False, "prohibited_action"
    if action not in SAFE_MODEL_ACTIONS | CONSEQUENTIAL_ACTIONS:
        return False, "action_not_allowlisted"
    work_order = session.get(WorkOrder, work_order_id) if work_order_id else None
    if work_order_id and not work_order:
        return False, "unknown_work_order"
    if work_order and client_id is not None and work_order.client_id != client_id:
        return False, "tenant_mismatch"
    bound_client_id = work_order.client_id if work_order else client_id
    if bound_client_id is None:
        return False, "tenant_context_required"
    call_key = (call_key or "").strip()
    if not call_key:
        return False, "idempotency_key_required"
    receipt, fresh = claim_action(
        session,
        "MODEL_TOOL_CALL",
        call_key,
        client_id=bound_client_id,
        work_order_id=work_order_id,
    )
    if not fresh:
        return False, "duplicate_model_action"
    if work_order_id and critical_safety_active(session, work_order_id) and action in CONSEQUENTIAL_ACTIONS:
        return False, "critical_safety_conflict"
    if action in CONSEQUENTIAL_ACTIONS and not ai_side_effects_enabled(session):
        return False, "ai_side_effects_disabled"
    return True, ""
