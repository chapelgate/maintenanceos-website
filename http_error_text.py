from __future__ import annotations

from secret_patterns import redact_secrets

HTTP_ERROR_DETAIL_MAX = 2000


def sanitize_http_detail(detail: object) -> object:
    if not isinstance(detail, str):
        return detail
    value = redact_secrets(detail)
    if len(value) > HTTP_ERROR_DETAIL_MAX:
        return value[:HTTP_ERROR_DETAIL_MAX]
    return value
