from __future__ import annotations

import json
from typing import Any

from secret_patterns import redact_secrets

HTTP_ERROR_DETAIL_MAX = 2000
HTTP_ERROR_JSON_MAX = 4000


def sanitize_http_detail(detail: object) -> object:
    if not isinstance(detail, str):
        return detail
    value = redact_secrets(detail)
    if len(value) > HTTP_ERROR_DETAIL_MAX:
        return value[:HTTP_ERROR_DETAIL_MAX]
    return value


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
