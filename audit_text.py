from __future__ import annotations

import re

BEARER_VALUE = re.compile(r"\bBearer\s+[^\s,;]+", re.IGNORECASE)
OPENAI_KEY = re.compile(r"\bsk-[A-Za-z0-9_.-]{8,}")
EMAIL_VALUE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_VALUE = re.compile(r"(?<!\w)\+[1-9][0-9]{7,14}(?!\w)")
PROVIDER_ID = re.compile(r"\b(?:AC|CA|MZ|SM)[0-9a-fA-F]{16,}\b")
AWS_ACCESS_KEY = re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")
JWT_VALUE = re.compile(r"\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b")
GOOGLE_API_KEY = re.compile(r"\bAIza[0-9A-Za-z_-]{10,}\b")
GITHUB_PAT = re.compile(r"\bghp_[A-Za-z0-9]{20,}\b")
GITHUB_FINE_PAT = re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b")
STRIPE_SECRET_KEY = re.compile(r"\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b")
SLACK_TOKEN = re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")
PEM_PRIVATE_KEY = re.compile(
    r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----.*?-----END [A-Z0-9 ]*PRIVATE KEY-----",
    re.DOTALL,
)


def redact_detail(detail: str) -> str:
    value = detail or ""
    value = BEARER_VALUE.sub("Bearer [REDACTED]", value)
    value = OPENAI_KEY.sub("[REDACTED]", value)
    value = EMAIL_VALUE.sub("[REDACTED]", value)
    value = PHONE_VALUE.sub("[REDACTED]", value)
    value = PROVIDER_ID.sub("[REDACTED]", value)
    value = AWS_ACCESS_KEY.sub("[REDACTED]", value)
    value = JWT_VALUE.sub("[REDACTED]", value)
    value = GOOGLE_API_KEY.sub("[REDACTED]", value)
    value = GITHUB_PAT.sub("[REDACTED]", value)
    value = GITHUB_FINE_PAT.sub("[REDACTED]", value)
    value = STRIPE_SECRET_KEY.sub("[REDACTED]", value)
    value = SLACK_TOKEN.sub("[REDACTED]", value)
    value = PEM_PRIVATE_KEY.sub("[REDACTED]", value)
    return value
