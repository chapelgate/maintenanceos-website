"""Structured operational events with a deliberately narrow, redacted schema."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import logging
import os
import re
from typing import Any

from request_context import request_id as current_request_id


SAFE_EVENT_FIELDS = {
    "duration_ms",
    "exception_type",
    "method",
    "outcome",
    "path",
    "reason_code",
    "request_id",
    "status",
    "transport",
    "client_id",
}
SENSITIVE_KEY = re.compile(
    r"(?:authorization|body|caller|cookie|credential|detail|email|key|number|"
    r"password|phone|secret|signature|token|transcript)",
    re.IGNORECASE,
)
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
GITHUB_OAUTH_TOKEN = re.compile(r"\bgho_[A-Za-z0-9]{20,}\b")
GITHUB_USER_TOKEN = re.compile(r"\bghu_[A-Za-z0-9]{20,}\b")
GITHUB_SESSION_TOKEN = re.compile(r"\bghs_[A-Za-z0-9]{20,}\b")
NPM_TOKEN = re.compile(r"\bnpm_[A-Za-z0-9]{20,}\b")
XOXE_TOKEN = re.compile(r"\bxoxe-[A-Za-z0-9-]{10,}\b")
SENDGRID_API_KEY = re.compile(r"\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b")
DIGITALOCEAN_PAT = re.compile(r"\bdop_v1_[A-Za-z0-9]{20,}\b")
GITLAB_PAT = re.compile(r"\bglpat-[A-Za-z0-9_-]{16,}\b")
TWILIO_TOKEN = re.compile(r"\bVA[0-9A-Za-z]{32}\b")
HUGGINGFACE_TOKEN = re.compile(r"\bhf_[A-Za-z0-9]{20,}\b")
MAILGUN_API_KEY = re.compile(r"\bkey-[A-Za-z0-9]{20,}\b")
AUTH0_TOKEN = re.compile(r"\bauth0_[A-Za-z0-9]{20,}\b")
OKTA_TOKEN = re.compile(r"\bokta_[A-Za-z0-9]{20,}\b")
PYPI_TOKEN = re.compile(r"\bpypi-[A-Za-z0-9_-]{20,}\b")
SHOPIFY_TOKEN = re.compile(r"\b(?:shpat|shpss|shpca|shppa)_[A-Za-z0-9]{20,}\b")
SLACK_TOKEN = re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b")
PEM_PRIVATE_KEY = re.compile(r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----.*?-----END [A-Z0-9 ]*PRIVATE KEY-----", re.DOTALL)


def _redact(value: Any, key: str = "") -> Any:
    if SENSITIVE_KEY.search(key):
        return "[REDACTED]"
    if isinstance(value, dict):
        return {str(item_key): _redact(item_value, str(item_key)) for item_key, item_value in value.items()}
    if isinstance(value, (list, tuple)):
        return [_redact(item) for item in value]
    if isinstance(value, str):
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
        value = SLACK_TOKEN.sub("[REDACTED]", value)
        value = SHOPIFY_TOKEN.sub("[REDACTED]", value)
        value = AUTH0_TOKEN.sub("[REDACTED]", value)
        value = OKTA_TOKEN.sub("[REDACTED]", value)
        value = PYPI_TOKEN.sub("[REDACTED]", value)
        return PEM_PRIVATE_KEY.sub("[REDACTED]", value)
    if value is None or isinstance(value, (bool, int, float)):
        return value
    return type(value).__name__


class RedactedJsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "level": record.levelname,
            "event": str(getattr(record, "event_name", record.getMessage()))[:100],
        }
        fields = getattr(record, "event_fields", {})
        if isinstance(fields, dict):
            payload.update({
                key: _redact(value, key)
                for key, value in fields.items()
                if key in SAFE_EVENT_FIELDS
                and not (key == "client_id" and not (isinstance(value, int) and not isinstance(value, bool)))
            })
        return json.dumps(payload, sort_keys=True, separators=(",", ":"))


LOGGER = logging.getLogger("maintenanceos.operations")
if not LOGGER.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(RedactedJsonFormatter())
    LOGGER.addHandler(handler)
LOGGER.setLevel(logging.INFO)
LOGGER.propagate = False


def structured_logging_enabled() -> bool:
    return os.getenv("ENABLE_STRUCTURED_LOGGING", "false").strip().lower() == "true"


def operational_event(event: str, **fields: Any) -> None:
    if not structured_logging_enabled():
        return
    rid = current_request_id()
    if rid and "request_id" not in fields:
        fields = {**fields, "request_id": rid}
    LOGGER.info(
        "operational_event",
        extra={
            "event_name": re.sub(r"[^a-z0-9_.-]", "_", (event or "unknown").lower())[:100],
            "event_fields": fields,
        },
    )
