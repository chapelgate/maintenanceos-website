import asyncio

import ingress_security as sec


def test_max_request_bytes_is_64kib():
    assert sec.MAX_REQUEST_BYTES == 64 * 1024


def test_invalid_and_conflicting_content_length():
    length, err = sec._content_length({"headers": [(b"content-length", b"abc")]})
    assert length is None and err == "invalid_content_length"
    length, err = sec._content_length(
        {"headers": [(b"content-length", b"10"), (b"content-length", b"11")]}
    )
    assert length is None and err == "conflicting_content_length"
    length, err = sec._content_length({"headers": [(b"content-length", b"12")]})
    assert length == 12 and err is None


def test_declared_oversize_returns_413():
    status_holder = {}

    async def app(scope, receive, send):
        status_holder["app_ran"] = True
        await send({"type": "http.response.start", "status": 200, "headers": []})
        await send({"type": "http.response.body", "body": b"ok"})

    boundary = sec.HttpSecurityBoundary(app, maximum_body_bytes=sec.MAX_REQUEST_BYTES)
    scope = {
        "type": "http",
        "asgi": {"version": "3.0"},
        "http_version": "1.1",
        "method": "POST",
        "path": "/work-orders",
        "raw_path": b"/work-orders",
        "root_path": "",
        "scheme": "http",
        "query_string": b"",
        "headers": [(b"content-length", str(sec.MAX_REQUEST_BYTES + 1).encode("ascii"))],
        "client": ("127.0.0.1", 12345),
        "server": ("test", 80),
        "state": {},
    }

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    messages = []

    async def send(message):
        messages.append(message)

    asyncio.run(boundary(scope, receive, send))
    starts = [m for m in messages if m.get("type") == "http.response.start"]
    assert starts and starts[0]["status"] == 413
    assert "app_ran" not in status_holder
