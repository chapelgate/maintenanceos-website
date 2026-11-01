"""Structured operational events with a deliberately narrow, redacted schema."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import logging
import os
import re
from typing import Any

from request_context import request_id as current_request_id
from secret_patterns import SENSITIVE_KEY, redact_secrets


SAFE_EVENT_FIELDS = {
    "action",
    "correlation_id",
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
def _redact(value: Any, key: str = "") -> Any:
    if SENSITIVE_KEY.search(key):
        return "[REDACTED]"
    if isinstance(value, dict):
        return {str(item_key): _redact(item_value, str(item_key)) for item_key, item_value in value.items()}
    if isinstance(value, (list, tuple)):
        return [_redact(item) for item in value]
    if isinstance(value, str):
        return redact_secrets(value)
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
    if rid:
        if "request_id" not in fields:
            fields = {**fields, "request_id": rid}
        if "correlation_id" not in fields:
            fields = {**fields, "correlation_id": rid}
    LOGGER.info(
        "operational_event",
        extra={
            "event_name": re.sub(r"[^a-z0-9_.-]", "_", (event or "unknown").lower())[:100],
            "event_fields": fields,
        },
    )

def log_event_valid_fields(fields: dict[str, Any]) -> dict[str, Any]:
    """Return only SAFE_EVENT_FIELDS; drop secret-shaped keys."""
    if not isinstance(fields, dict):
        return {}
    out: dict[str, Any] = {}
    for key, value in fields.items():
        name = str(key)
        if name not in SAFE_EVENT_FIELDS:
            continue
        if SENSITIVE_KEY.search(name):
            continue
        out[name] = value
    return out


def error_event(exc: BaseException, event: str = "error", **fields: Any) -> None:
    """Emit a redacted operational error with exception_type only from the type name."""
    safe = log_event_valid_fields(fields)
    safe["exception_type"] = type(exc).__name__[:100]
    if "outcome" not in safe:
        safe["outcome"] = "error"
    operational_event(event, **safe)

