POSTCODE_MAX = 20
PHONE_MAX = 50


def normalise_phone(value: str) -> str:
    raw = value or ""
    if len(raw) > PHONE_MAX:
        return ""
    if any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in raw
    ):
        return ""
    s = "".join(ch for ch in raw if ch.isdigit() or ch == "+")
    if s.startswith("0044"):
        s = "+44" + s[4:]
    if s.startswith("07"):
        s = "+44" + s[1:]
    if len(s) > PHONE_MAX:
        return ""
    return s


def normalise_postcode(value: str) -> str:
    raw = value or ""
    if any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in raw
    ):
        return ""
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
