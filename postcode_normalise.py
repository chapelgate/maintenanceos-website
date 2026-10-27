POSTCODE_MAX = 20


def normalise_postcode(value: str) -> str:
    raw = value or ""
    if len(raw) > POSTCODE_MAX:
        return ""
    normalised = "".join(raw.upper().split())
    if len(normalised) > POSTCODE_MAX:
        return ""
    return normalised


def postcode_matches(expected: str, supplied: str) -> bool:
    a = normalise_postcode(expected)
    b = normalise_postcode(supplied)
    return bool(a and b and a == b)
