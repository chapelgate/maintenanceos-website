POSTCODE_MAX = 20


def normalise_postcode(value: str) -> str:
    raw = (value or "").strip().upper()
    if len(raw) > POSTCODE_MAX:
        return ""
    s = "".join(ch for ch in raw if ch.isalnum())
    if len(s) > POSTCODE_MAX:
        return ""
    if len(s) > 3:
        s = s[:-3] + " " + s[-3:]
    return s


def postcode_matches(stored: str, supplied: str) -> bool:
    a = normalise_postcode(stored)
    b = normalise_postcode(supplied)
    return a == b
