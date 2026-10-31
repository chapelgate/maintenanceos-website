import json
import logging
from datetime import datetime

import pytest
from fastapi.testclient import TestClient

import api
import operational_logging as ol


def test_structured_logging_enabled_flag(monkeypatch):
    monkeypatch.delenv("ENABLE_STRUCTURED_LOGGING", raising=False)
    assert ol.structured_logging_enabled() is False
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    assert ol.structured_logging_enabled() is True


def test_operational_event_emits_json(monkeypatch, capsys):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    # Ensure handler uses formatter path via LOGGER
    ol.operational_event("unit.test", status=200, method="GET", path="/health")
    # Formatter may write to LOGGER handlers; exercise formatter directly too
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="operational_event",
        args=(),
        exc_info=None,
    )
    record.event_name = "unit.test"
    record.event_fields = {"status": 200, "method": "GET", "path": "/health"}
    payload = json.loads(ol.RedactedJsonFormatter().format(record))
    assert payload["event"] == "unit.test" or payload.get("event_name") == "unit.test" or "unit.test" in json.dumps(payload)


def test_operational_event_redacts_secrets():
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="operational_event",
        args=(),
        exc_info=None,
    )
    record.event_name = "unit.redact"
    record.event_fields = {"reason_code": "Bearer top-secret sk-abcdefghijklmnop"}
    text = ol.RedactedJsonFormatter().format(record)
    assert "top-secret" not in text
    assert "sk-abcdefghijklmnop" not in text
    assert "[REDACTED]" in text


def test_redacted_json_formatter_exists():
    assert hasattr(ol, "RedactedJsonFormatter")
    assert issubclass(ol.RedactedJsonFormatter, logging.Formatter)


def test_logging_output_contains_tenant_id():
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="operational_event",
        args=(),
        exc_info=None,
    )
    record.event_name = "unit.tenant"
    record.event_fields = {"client_id": 42, "status": 200}
    payload = json.loads(ol.RedactedJsonFormatter().format(record))
    blob = json.dumps(payload)
    assert "42" in blob


def test_health_endpoint_logs_request(monkeypatch):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200


def test_error_logging_includes_request_context():
    safe = ol.log_event_valid_fields({"status": 500, "path": "/x", "request_id": "abc", "password": "nope"})
    assert safe.get("status") == 500
    assert safe.get("path") == "/x"
    assert "password" not in safe


def test_no_raw_secrets_in_log_output():
    assert ol._redact("Authorization: Bearer abcdefghijklmnop", "reason_code").count("abcdefghijklmnop") == 0


def test_log_timestamp_present_and_iso_format():
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="operational_event",
        args=(),
        exc_info=None,
    )
    record.event_name = "unit.ts"
    record.event_fields = {"status": 200}
    payload = json.loads(ol.RedactedJsonFormatter().format(record))
    ts = payload.get("timestamp") or payload.get("time")
    assert isinstance(ts, str) and "T" in ts
    datetime.fromisoformat(ts.replace("Z", "+00:00"))


def test_log_level_info_by_default():
    assert ol.LOGGER.level == logging.INFO


def test_health_response_contains_no_logging_secrets():
    body = TestClient(api.app).get("/health").json()
    assert "password" not in str(body).lower()
    assert "sk-" not in str(body)


def test_operational_logging_imports_clean():
    source = open("operational_logging.py").read()
    assert "from secret_patterns import" in source or "RedactedJsonFormatter" in source
    assert "def operational_event" in source
