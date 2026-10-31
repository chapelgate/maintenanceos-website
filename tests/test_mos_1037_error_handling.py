import operational_logging as ol


def test_log_event_valid_fields():
    raw = {
        "status": "failed",
        "outcome": "error",
        "exception_type": "ValueError",
        "path": "/health",
        "method": "GET",
        "request_id": "req-1",
        "duration_ms": 12,
        "reason_code": "timeout",
        "transport": "http",
        "client_id": 7,
        "password": "secret",
        "token": "abc",
        "body": "nope",
        "unknown": "drop-me",
    }
    safe = ol.log_event_valid_fields(raw)
    assert safe == {
        "status": "failed",
        "outcome": "error",
        "exception_type": "ValueError",
        "path": "/health",
        "method": "GET",
        "request_id": "req-1",
        "duration_ms": 12,
        "reason_code": "timeout",
        "transport": "http",
        "client_id": 7,
    }
    assert "password" not in safe
    assert "token" not in safe
    assert "body" not in safe
    assert "unknown" not in safe


def test_event_no_secret_fields(monkeypatch):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    captured = []

    def _capture(event, **fields):
        captured.append((event, fields))

    monkeypatch.setattr(ol, "operational_event", _capture)
    try:
        raise RuntimeError("boom sk-abcdefghijklmnop")
    except RuntimeError as exc:
        ol.error_event(
            exc,
            event="handler.failure",
            status="failed",
            path="/x",
            password="should-drop",
            authorization="Bearer secret",
            body="raw",
            unknown="drop",
        )
    assert len(captured) == 1
    event, fields = captured[0]
    assert event == "handler.failure"
    assert fields["exception_type"] == "RuntimeError"
    assert fields["outcome"] == "error"
    assert fields["status"] == "failed"
    assert fields["path"] == "/x"
    assert "password" not in fields
    assert "authorization" not in fields
    assert "body" not in fields
    assert "unknown" not in fields
    assert "boom" not in str(fields)
    assert "sk-" not in str(fields)
