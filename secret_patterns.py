"""Shared secret redaction patterns.

Single source of truth for the regex patterns used to scrub secrets from
audit text, HTTP error detail, and structured operational log events.
Kept here so every redaction site changes in one place.
"""

from __future__ import annotations

import re

BEARER_VALUE = re.compile(r"\bBearer\s+[^\s,;]+", re.IGNORECASE)
OPENAI_KEY = re.compile(r"\bsk-[A-Za-z0-9_.-]{8,}")
EMAIL_VALUE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_VALUE = re.compile(r"(?<!\w)\+[1-9][0-9]{7,14}(?!\w)")
PROVIDER_ID = re.compile(r"\b(?:AC|CA|MZ|SM)[0-9a-fA-F]{16,}\b")
SENSITIVE_KEY = re.compile(
    r"(?:authorization|body|caller|cookie|credential|detail|email|key|number|"
    r"password|phone|secret|signature|token|transcript)",
    re.IGNORECASE,
)


def redact_value(value: str) -> str:
    """Redact secret-bearing substrings from a string value."""
    value = BEARER_VALUE.sub("Bearer [REDACTED]", value)
    value = OPENAI_KEY.sub("[REDACTED]", value)
    value = EMAIL_VALUE.sub("[REDACTED]", value)
    value = PHONE_VALUE.sub("[REDACTED]", value)
    return PROVIDER_ID.sub("[REDACTED]", value)
