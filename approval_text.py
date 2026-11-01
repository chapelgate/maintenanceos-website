PROPOSED_ACTION_MAX = 1000
APPROVAL_REASON_MAX = 1000


def _has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 and ch not in {"\t", "\n", "\r"} for ch in value)


def bounded_proposed_action(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > PROPOSED_ACTION_MAX:
        raise ValueError("proposed_action invalid")
    if _has_control_chars(text):
        raise ValueError("proposed_action control characters")
    return text


def bounded_approval_reason(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > APPROVAL_REASON_MAX:
        raise ValueError("approval reason invalid")
    if _has_control_chars(text):
        raise ValueError("approval reason control characters")
    return text
