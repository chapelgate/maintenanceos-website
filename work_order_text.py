WORK_ORDER_DESCRIPTION_MAX = 8000
_ALLOWED_CONTROLS = frozenset("\n\r\t")


def problem_description_error(text: str) -> str | None:
    value = "" if text is None else str(text)
    stripped = value.strip()
    if not stripped:
        return "Problem description is required"
    if any(
        (ord(ch) < 32 and ch not in _ALLOWED_CONTROLS)
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    ):
        return "Problem description contains control characters"
    if len(stripped) > WORK_ORDER_DESCRIPTION_MAX:
        return "Problem description is too long"
    return None
