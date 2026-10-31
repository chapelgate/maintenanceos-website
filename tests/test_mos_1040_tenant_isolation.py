import json
import logging

import pytest

import operational_logging as ol
import tenant_security as ts


def test_voice_tenant_mode_env(monkeypatch):
    monkeypatch.delenv("VOICE_TENANT_MODE", raising=False)
    monkeypatch.delenv("VOICE_TEST_CLIENT_ID", raising=False)
    assert ts.configured_voice_client_id() is None

    monkeypatch.setenv("VOICE_TENANT_MODE", "open")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID", "42")
    assert ts.configured_voice_client_id() is None

    monkeypatch.setenv("VOICE_TENANT_MODE", "isolated_test")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID", "0")
    assert ts.configured_voice_client_id() is None

    monkeypatch.setenv("VOICE_TEST_CLIENT_ID", "7")
    assert ts.configured_voice_client_id() == 7

    monkeypatch.setenv("VOICE_TEST_CLIENT_ID", "not-int")
    assert ts.configured_voice_client_id() is None


def test_isolation_boundary_in_operational_logging(monkeypatch, caplog):
    assert "client_id" in ol.SAFE_EVENT_FIELDS
    assert "authorization" not in ol.SAFE_EVENT_FIELDS
    assert "token" not in ol.SAFE_EVENT_FIELDS
    assert "password" not in ol.SAFE_EVENT_FIELDS

    filtered = ol.log_event_valid_fields(
        {
            "client_id": 12,
            "path": "/health",
            "authorization": "Bearer secret",
            "token": "leak",
            "password": "x",
            "status": 200,
        }
    )
    assert filtered == {"client_id": 12, "path": "/health", "status": 200}

    # string client_id must not pass the formatter allowlist
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    handler = logging.StreamHandler()
    formatter = ol.RedactedJsonFormatter()
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="operational_event",
        args=(),
        exc_info=None,
    )
    record.event_name = "tenant_probe"
    record.event_fields = {"client_id": "12", "path": "/x", "status": 200}
    payload = json.loads(formatter.format(record))
    assert "client_id" not in payload
    assert payload["path"] == "/x"

    record.event_fields = {"client_id": 12, "path": "/y", "status": 200}
    payload = json.loads(formatter.format(record))
    assert payload["client_id"] == 12


def test_no_secret_in_tenant_event(monkeypatch, capsys):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    # Force a fresh handler write through the module logger
    root = ol.LOGGER
    with capsys.disabled():
        pass
    # Capture via a temporary handler
    class Buf(logging.Handler):
        def __init__(self):
            super().__init__()
            self.lines = []

        def emit(self, record):
            self.lines.append(self.format(record))

    buf = Buf()
    buf.setFormatter(ol.RedactedJsonFormatter())
    root.addHandler(buf)
    try:
        ol.operational_event(
            "tenant_access",
            client_id=3,
            path="/contractor/decision",
            status=200,
            authorization="Bearer sk-abcdefghijklmnop",
            token="ghp_AAAAAAAAAAAAAAAAAAAAAAAA",
            detail="user@example.com called +441234567890",
        )
    finally:
        root.removeHandler(buf)

    assert buf.lines, "expected structured log line"
    line = buf.lines[-1]
    payload = json.loads(line)
    blob = json.dumps(payload)
    assert "Bearer" not in blob
    assert "sk-abcdefghijklmnop" not in blob
    assert "ghp_" not in blob
    assert "user@example.com" not in blob
    assert "+441234567890" not in blob
    assert payload.get("client_id") == 3
    assert "authorization" not in payload
    assert "token" not in payload
    assert "detail" not in payload
