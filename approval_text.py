PROPOSED_ACTION_MAX = 1000
APPROVAL_REASON_MAX = 1000


def bounded_proposed_action(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > PROPOSED_ACTION_MAX:
        raise ValueError("proposed_action invalid")
    return text


def bounded_approval_reason(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > APPROVAL_REASON_MAX:
        raise ValueError("approval reason invalid")
    return text