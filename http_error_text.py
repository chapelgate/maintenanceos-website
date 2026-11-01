from __future__ import annotations

import json
from typing import Any

from secret_patterns import SENSITIVE_KEY, redact_secrets

HTTP_ERROR_DETAIL_MAX = 2000
HTTP_ERROR_JSON_MAX = 4000


def _sanitize_structure(value: Any, key: str = "") -> Any:
    if key and SENSITIVE_KEY.search(key):
        return "[REDACTED]"
    if isinstance(value, str):
        redacted = redact_secrets(value)
        if len(redacted) > HTTP_ERROR_DETAIL_MAX:
            return redacted[:HTTP_ERROR_DETAIL_MAX]
        return redacted
    if isinstance(value, dict):
        return {
            str(item_key): _sanitize_structure(item_value, str(item_key))
            for item_key, item_value in value.items()
        }
    if isinstance(value, (list, tuple)):
        return [_sanitize_structure(item) for item in value]
    if value is None or isinstance(value, (bool, int, float)):
        return value
    return type(value).__name__


def sanitize_http_detail(detail: object) -> object:
    if isinstance(detail, str):
        value = redact_secrets(detail)
        if len(value) > HTTP_ERROR_DETAIL_MAX:
            return value[:HTTP_ERROR_DETAIL_MAX]
        return value
    if isinstance(detail, (dict, list, tuple)):
        sanitized = _sanitize_structure(detail)
        try:
            encoded = json.dumps(sanitized, default=str, separators=(",", ":"), sort_keys=True)
            if len(encoded) > HTTP_ERROR_JSON_MAX:
                return {"_truncated": True, "size_limit": HTTP_ERROR_JSON_MAX}
        except (TypeError, ValueError):
            return "Request failed"
        return sanitized
    return detail


def sanitize_json_payload(payload: Any) -> str:
    if isinstance(payload, str):
        text = payload
    else:
        try:
            text = json.dumps(payload, default=str, separators=(",", ":"), sort_keys=True)
        except (TypeError, ValueError):
            text = str(payload)
    value = redact_secrets(text)
    if len(value) > HTTP_ERROR_JSON_MAX:
        return value[:HTTP_ERROR_JSON_MAX]
    return value
