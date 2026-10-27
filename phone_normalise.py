PHONE_MAX = 50


def normalise_phone(value: str) -> str:
    raw = value or ""
    if len(raw) > PHONE_MAX:
        return ""
    s = "".join(ch for ch in raw if ch.isdigit() or ch == "+")
    if s.startswith("0044"):
        s = "+44" + s[4:]
    if s.startswith("07"):
        s = "+44" + s[1:]
    if len(s) > PHONE_MAX:
        return ""
    return s
