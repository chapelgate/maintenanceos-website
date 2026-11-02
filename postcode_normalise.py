POSTCODE_MAX = 20


def _has_control_chars(value: str) -> bool:
    return any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def normalise_postcode(value: str) -> str:
    raw = value or ""
    if _has_control_chars(raw):
        return ""
    if len(raw) > POSTCODE_MAX:
        return ""
    normalised = "".join(raw.upper().split())
    if len(normalised) > POSTCODE_MAX:
        return ""
    return normalised


def postcode_matches(expected: str, supplied: str) -> bool:
    if _has_control_chars(expected) or _has_control_chars(supplied):
        return False
    a = normalise_postcode(expected)
    b = normalise_postcode(supplied)
    return bool(a and b and a == b)


def is_synthetic_test_postcode(value: str) -> bool:
    normalised = normalise_postcode(value)
    return bool(normalised) and normalised.startswith("ZZ")
