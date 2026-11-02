ESCALATION_REASON_MAX = 2000


def _has_control_chars(value: str) -> bool:
    return any(
        (ord(ch) < 32 and ch not in {"\t", "\n", "\r"})
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def bounded_escalation_reason(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > ESCALATION_REASON_MAX:
        raise ValueError("escalation reason invalid")
    if _has_control_chars(text):
        raise ValueError("escalation reason control characters")
    return text
