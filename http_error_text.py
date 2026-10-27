from __future__ import annotations

import re

BEARER_VALUE = re.compile(r"\bBearer\s+[^\s,;]+", re.IGNORECASE)
OPENAI_KEY = re.compile(r"\bsk-[A-Za-z0-9_.-]{8,}")
EMAIL_VALUE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_VALUE = re.compile(r"(?<!\w)\+[1-9][0-9]{7,14}(?!\w)")
PROVIDER_ID = re.compile(r"\b(?:AC|CA|MZ|SM)[0-9a-fA-F]{16,}\b")


HTTP_ERROR_DETAIL_MAX = 2000


def sanitize_http_detail(detail: object) -> object:
    if not isinstance(detail, str):
        return detail
    value = detail
    value = BEARER_VALUE.sub("Bearer [REDACTED]", value)
    value = OPENAI_KEY.sub("[REDACTED]", value)
    value = EMAIL_VALUE.sub("[REDACTED]", value)
    value = PHONE_VALUE.sub("[REDACTED]", value)
    value = PROVIDER_ID.sub("[REDACTED]", value)
    if len(value) > HTTP_ERROR_DETAIL_MAX:
        return value[:HTTP_ERROR_DETAIL_MAX]
    return value
