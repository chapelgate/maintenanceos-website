from __future__ import annotations

from secret_patterns import redact_secrets


_ALLOWED_CONTROLS = frozenset({"\t", "\n", "\r"})


def _has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 and ch not in _ALLOWED_CONTROLS for ch in value)


def redact_detail(detail: str) -> str:
    detail = detail or ""
    if _has_control_chars(detail):
        raise ValueError("audit detail control characters")
    return redact_secrets(detail)
