from __future__ import annotations

from secret_patterns import redact_secrets


def redact_detail(detail: str) -> str:
    return redact_secrets(detail or "")
