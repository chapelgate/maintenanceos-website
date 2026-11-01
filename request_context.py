"""Request correlation context carried end-to-end through HTTP, worker, audit and logging."""

from __future__ import annotations

import contextvars

_request_id: contextvars.ContextVar[str] = contextvars.ContextVar("mos_request_id", default="")


REQUEST_ID_MAX = 128


def set_request_id(request_id: str | None) -> None:
    value = request_id or ""
    if len(value) > REQUEST_ID_MAX:
        value = ""
    elif any(ord(ch) < 32 for ch in value):
        value = ""
    _request_id.set(value)


def clear_request_id() -> None:
    _request_id.set("")


def request_id() -> str:
    return _request_id.get()


def audit_detail(detail: dict) -> dict:
    rid = request_id()
    if rid:
        detail.setdefault("request_id", rid)
    return detail
