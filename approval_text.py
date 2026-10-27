PROPOSED_ACTION_MAX = 1000


def bounded_proposed_action(value: str) -> str:
    text = (value or "").strip()
    if not text or len(text) > PROPOSED_ACTION_MAX:
        raise ValueError("proposed_action invalid")
    return text
