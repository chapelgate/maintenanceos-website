"""Shared secret redaction patterns.

Single source of truth for the regex patterns used to scrub secrets from
audit text, HTTP error detail, and structured operational log events.
Kept here so every redaction site changes in one place.
"""

from __future__ import annotations

import re

SENSITIVE_KEY = re.compile(
    r"(?:authorization|body|caller|cookie|credential|detail|email|key|number|"
    r"password|phone|secret|signature|token|transcript)",
    re.IGNORECASE,
)

def secret_key_known(key: str) -> bool:
    value = (key or "").strip()
    if not value or any(ord(ch) < 32 for ch in value):
        return False
    return bool(SENSITIVE_KEY.search(value))

BEARER_VALUE = re.compile(r"\bBearer\s+[^\s,;]+", re.IGNORECASE)
OPENAI_KEY = re.compile(r"\bsk-[A-Za-z0-9_.-]{8,}")
EMAIL_VALUE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_VALUE = re.compile(r"(?<!\w)\+[1-9][0-9]{7,14}(?!\w)")
PROVIDER_ID = re.compile(r"\b(?:AC|CA|MZ|SM)[0-9a-fA-F]{16,}\b")
AWS_ACCESS_KEY = re.compile(r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b")
AWS_SECRET_KEY = re.compile(r"\b(?![0-9]+$)[A-Za-z0-9/+=]{40}\b")
JWT_VALUE = re.compile(r"\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b")
GOOGLE_API_KEY = re.compile(r"\bAIza[0-9A-Za-z_-]{10,}\b")
GITHUB_PAT = re.compile(r"\bghp_[A-Za-z0-9]{20,}\b")
GITHUB_FINE_PAT = re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b")
STRIPE_SECRET_KEY = re.compile(r"\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b")
WHSEC_VALUE = re.compile(r"\bwhsec_[A-Za-z0-9]+\b")
GITHUB_OAUTH_TOKEN = re.compile(r"\bgho_[A-Za-z0-9]{20,}\b")
GITHUB_USER_TOKEN = re.compile(r"\bghu_[A-Za-z0-9]{20,}\b")
GITHUB_SESSION_TOKEN = re.compile(r"\bghs_[A-Za-z0-9]{20,}\b")
NPM_TOKEN = re.compile(r"\bnpm_[A-Za-z0-9]{20,}\b")
XOXE_TOKEN = re.compile(r"\bxoxe-[A-Za-z0-9-]{10,}\b")
SENDGRID_API_KEY = re.compile(r"\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b")
DIGITALOCEAN_PAT = re.compile(r"\bdop_v1_[A-Za-z0-9]{20,}\b")
GITLAB_PAT = re.compile(r"\bglpat-[A-Za-z0-9_-]{16,}\b")
TWILIO_TOKEN = re.compile(r"\bVA[0-9A-Za-z]{32}\b")
HUGGINGFACE_TOKEN = re.compile(r"\bhf_[A-Za-z0-9_-]{16,}\b")
MAILGUN_API_KEY = re.compile(r"\bkey-[A-Za-z0-9]{16,}\b")
SENDGRID_KEY = SENDGRID_API_KEY
GITLAB_PERSONAL_ACCESS_TOKEN = re.compile(r"\bglpat-[A-Za-z0-9_-]{20,}\b")
MAILGUN_KEY = MAILGUN_API_KEY
DIGITALOCEAN_TOKEN = re.compile(r"\bdop_v1_[A-Za-z0-9]{16,}\b")
AUTH0_TOKEN = re.compile(r"\bauth0_[A-Za-z0-9]{20,}\b")
OKTA_TOKEN = re.compile(r"\bokta_[A-Za-z0-9]{20,}\b")
PYPI_TOKEN = re.compile(r"\bpypi-[A-Za-z0-9_-]{20,}\b")
SHOPIFY_TOKEN = re.compile(r"\b(?:shpat|shpss|shpca|shppa)_[A-Za-z0-9]{20,}\b")
SLACK_TOKEN = re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")
PEM_PRIVATE_KEY = re.compile(
    r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----.*?-----END [A-Z0-9 ]*PRIVATE KEY-----",
    re.DOTALL,
)


def redact_secrets(value: str) -> str:
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
    value = WHSEC_VALUE.sub("[REDACTED]", value)
    value = AWS_SECRET_KEY.sub("[REDACTED]", value)
    value = GITHUB_OAUTH_TOKEN.sub("[REDACTED]", value)
    value = GITHUB_USER_TOKEN.sub("[REDACTED]", value)
    value = GITHUB_SESSION_TOKEN.sub("[REDACTED]", value)
    value = NPM_TOKEN.sub("[REDACTED]", value)
    value = XOXE_TOKEN.sub("[REDACTED]", value)
    value = SENDGRID_API_KEY.sub("[REDACTED]", value)
    value = DIGITALOCEAN_PAT.sub("[REDACTED]", value)
    value = GITLAB_PAT.sub("[REDACTED]", value)
    value = HUGGINGFACE_TOKEN.sub("[REDACTED]", value)
    value = MAILGUN_API_KEY.sub("[REDACTED]", value)
    value = SENDGRID_KEY.sub("[REDACTED]", value)
    value = GITLAB_PERSONAL_ACCESS_TOKEN.sub("[REDACTED]", value)
    value = MAILGUN_KEY.sub("[REDACTED]", value)
    value = DIGITALOCEAN_TOKEN.sub("[REDACTED]", value)
    value = SLACK_TOKEN.sub("[REDACTED]", value)
    value = TWILIO_TOKEN.sub("[REDACTED]", value)
    value = AUTH0_TOKEN.sub("[REDACTED]", value)
    value = OKTA_TOKEN.sub("[REDACTED]", value)
    value = SHOPIFY_TOKEN.sub("[REDACTED]", value)
    value = PYPI_TOKEN.sub("[REDACTED]", value)
    value = PEM_PRIVATE_KEY.sub("[REDACTED]", value)
    return value


def redact_value(value: str) -> str:
    return redact_secrets(value)
