ESCALATION_REASON_MAX = 2000


def bounded_escalation_reason(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > ESCALATION_REASON_MAX:
        raise ValueError("escalation reason invalid")
    return text
