"""Bounded local safeguards for HTTP and WebSocket ingress.

These controls supplement, but do not replace, distributed edge limits.
"""

from __future__ import annotations

from collections import deque
import os
import re
import threading
import time
import uuid

from starlette.responses import PlainTextResponse

from operational_logging import operational_event
from request_context import clear_request_id, set_request_id


MAX_REQUEST_BYTES = 64 * 1024
MAX_WEBSOCKET_EVENT_BYTES = 256 * 1024
PUBLIC_HTTP_PATHS = {
    "/contractor/availability",
    "/contractor/complete",
    "/contractor/decision",
    "/messaging/inbound",
    "/voice/inbound",
    "/voice/stream-status",
}
SECURITY_HEADERS = (
    (b"x-content-type-options", b"nosniff"),
    (b"x-frame-options", b"DENY"),
    (b"referrer-policy", b"no-referrer"),
    (b"cache-control", b"no-store"),
    (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
    (b"cross-origin-opener-policy", b"same-origin"),
    (b"content-security-policy", b"default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"),
)
REQUEST_ID = re.compile(r"^[A-Za-z0-9._-]{1,64}$")


def bounded_rate(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default
    return value if 1 <= value <= 100_000 else default


def rate_setting_valid(name: str) -> bool:
    try:
        return 1 <= int(os.getenv(name, "")) <= 100_000
    except (TypeError, ValueError):
        return False


class SlidingWindowLimiter:
    def __init__(self, *, maximum_buckets: int = 4096):
        self.maximum_buckets = maximum_buckets
        self._buckets: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def allow(self, key: str, *, limit: int, window_seconds: float = 60.0, now: float | None = None) -> bool:
        instant = time.monotonic() if now is None else now
        cutoff = instant - window_seconds
        with self._lock:
            bucket = self._buckets.setdefault(key, deque())
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()
            if len(bucket) >= limit:
                return False
            bucket.append(instant)
            if len(self._buckets) > self.maximum_buckets:
                for old_key in list(self._buckets):
                    old_bucket = self._buckets[old_key]
                    while old_bucket and old_bucket[0] <= cutoff:
                        old_bucket.popleft()
                    if not old_bucket:
                        self._buckets.pop(old_key, None)
                    if len(self._buckets) <= self.maximum_buckets:
                        break
            return True

    def clear(self) -> None:
        with self._lock:
            self._buckets.clear()


PUBLIC_INGRESS_LIMITER = SlidingWindowLimiter()


def _peer(scope) -> str:
    client = scope.get("client")
    if isinstance(client, (list, tuple)) and client:
        return str(client[0])[:100]
    return "unknown"


def websocket_rate_allowed(websocket) -> bool:
    client = getattr(websocket, "client", None)
    host = str(getattr(client, "host", "unknown"))[:100]
    # Default 300/min supports a 100-call burst from a telephony edge IP with headroom.
    # Override via PUBLIC_WS_RATE_LIMIT_PER_MINUTE; edge limits still apply in production.
    return PUBLIC_INGRESS_LIMITER.allow(
        f"ws:{host}:/voice/media-stream",
        limit=bounded_rate("PUBLIC_WS_RATE_LIMIT_PER_MINUTE", 300),
    )


def websocket_event_within_limit(raw: object) -> bool:
    return isinstance(raw, str) and len(raw.encode("utf-8")) <= MAX_WEBSOCKET_EVENT_BYTES


def _content_length(scope) -> tuple[int | None, str | None]:
    values = []
    for name, value in scope.get("headers", []):
        if name.lower() == b"content-length":
            try:
                decoded = value.decode("ascii")
            except UnicodeDecodeError:
                return None, "invalid_content_length"
            if not decoded.isdigit():
                return None, "invalid_content_length"
            values.append(int(decoded))
    if len(set(values)) > 1:
        return None, "conflicting_content_length"
    return (values[0] if values else None), None


class HttpSecurityBoundary:
    def __init__(self, app, *, maximum_body_bytes: int = MAX_REQUEST_BYTES):
        self.app = app
        self.maximum_body_bytes = maximum_body_bytes

    async def __call__(self, scope, receive, send):
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        started = time.monotonic()
        status = 500
        headers = dict(scope.get("headers", []))
        supplied_request_id = headers.get(b"x-request-id", b"").decode("ascii", errors="ignore")
        request_id = supplied_request_id if REQUEST_ID.fullmatch(supplied_request_id) else uuid.uuid4().hex
        scope.setdefault("state", {})["request_id"] = request_id
        set_request_id(request_id)
        path = str(scope.get("path") or "/")[:200]
        method = str(scope.get("method") or "UNKNOWN")[:16]

        async def secured_send(message):
            nonlocal status
            if message.get("type") == "http.response.start":
                status = int(message.get("status", 500))
                blocked = {item[0] for item in SECURITY_HEADERS} | {b"x-request-id", b"set-cookie"}
                response_headers = [
                    (key, value)
                    for key, value in message.get("headers", [])
                    if key.lower() not in blocked
                ]
                response_headers.extend(SECURITY_HEADERS)
                response_headers.append((b"x-request-id", request_id.encode("ascii")))
                message = {**message, "headers": response_headers}
            await send(message)

        try:
            declared_length, length_error = _content_length(scope)
            if length_error:
                response = PlainTextResponse("Invalid Content-Length", status_code=400)
                await response(scope, receive, secured_send)
                return
            if declared_length is not None and declared_length > self.maximum_body_bytes:
                response = PlainTextResponse("Request too large", status_code=413)
                await response(scope, receive, secured_send)
                return

            if path in PUBLIC_HTTP_PATHS:
                allowed = PUBLIC_INGRESS_LIMITER.allow(
                    f"http:{_peer(scope)}:{method}:{path}",
                    limit=bounded_rate("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", 120),
                )
                if not allowed:
                    response = PlainTextResponse(
                        "Too many requests",
                        status_code=429,
                        headers={"Retry-After": "60"},
                    )
                    await response(scope, receive, secured_send)
                    return

            buffered = []
            received = 0
            more_body = True
            while more_body:
                message = await receive()
                buffered.append(message)
                if message.get("type") == "http.disconnect":
                    break
                if message.get("type") != "http.request":
                    continue
                body = message.get("body", b"")
                received += len(body)
                if received > self.maximum_body_bytes:
                    response = PlainTextResponse("Request too large", status_code=413)
                    await response(scope, receive, secured_send)
                    return
                more_body = bool(message.get("more_body", False))

            messages = iter(buffered)

            async def replay_receive():
                try:
                    return next(messages)
                except StopIteration:
                    return {"type": "http.request", "body": b"", "more_body": False}

            await self.app(scope, replay_receive, secured_send)
        except Exception as exc:
            operational_event(
                "http_request_failed",
                request_id=request_id,
                method=method,
                path=path,
                status=500,
                exception_type=type(exc).__name__,
            )
            raise
        finally:
            operational_event(
                "http_request",
                request_id=request_id,
                method=method,
                path=path,
                status=status,
                duration_ms=round((time.monotonic() - started) * 1000, 2),
            )
            clear_request_id()