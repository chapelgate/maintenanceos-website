import json
import logging

import operational_logging as ol


def _record(*, event_name="provider.failure", fields=None):
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.ERROR,
        pathname=__file__,
        lineno=1,
        msg="fallback message",
        args=(),
        exc_info=None,
    )
    record.event_name = event_name
    record.event_fields = fields or {}
    return record


def test_redact_rejects_sensitive_keys_before_value_processing():
    assert ol._redact("safe-looking", "authorization") == "[REDACTED]"
    assert ol._redact("safe-looking", "transcript") == "[REDACTED]"
    assert ol._redact("safe-looking", "phone_number") == "[REDACTED]"


def test_redact_scrubs_sensitive_values_inside_allowed_fields():
    raw = (
        "Bearer top-secret "
        "sk-abcdefghijklmnop "
        "resident@example.test "
        "+447700900123 "
        "CA0123456789abcdef0123456789abcdef"
    )
    redacted = ol._redact(raw, "reason_code")
    assert "top-secret" not in redacted
    assert "sk-abcdefghijklmnop" not in redacted
    assert "resident@example.test" not in redacted
    assert "+447700900123" not in redacted
    assert "CA0123456789abcdef0123456789abcdef" not in redacted
    assert "[REDACTED]" in redacted


def test_formatter_allows_only_declared_operational_fields_and_redacts_values():
    payload = json.loads(
        ol.RedactedJsonFormatter().format(
            _record(
                fields={
                    "status": "failed",
                    "reason_code": "contact resident@example.test",
                    "request_id": "req-123",
                    "body": "must-never-appear",
                    "transcript": "must-never-appear",
                    "unknown": "must-never-appear",
                }
            )
        )
    )
    assert payload["event"] == "provider.failure"
    assert payload["status"] == "failed"
    assert payload["reason_code"] == "contact [REDACTED]"
    assert payload["request_id"] == "req-123"
    assert "body" not in payload
    assert "transcript" not in payload
    assert "unknown" not in payload
    rendered = json.dumps(payload)
    assert "must-never-appear" not in rendered
    assert "resident@example.test" not in rendered


def test_structured_logging_is_fail_closed_when_not_explicitly_enabled(monkeypatch):
    monkeypatch.delenv("ENABLE_STRUCTURED_LOGGING", raising=False)
    calls = []
    monkeypatch.setattr(ol.LOGGER, "info", lambda *args, **kwargs: calls.append((args, kwargs)))
    ol.operational_event("provider.failure", status="failed")
    assert calls == []


def test_operational_event_normalises_event_name_and_passes_only_to_formatter(monkeypatch):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    calls = []
    monkeypatch.setattr(ol.LOGGER, "info", lambda *args, **kwargs: calls.append((args, kwargs)))
    ol.operational_event(
        "Provider Failure / TOKEN",
        status="failed",
        body="secret body",
        reason_code="Bearer abc123",
    )
    assert len(calls) == 1
    _args, kwargs = calls[0]
    assert kwargs["extra"]["event_name"] == "provider_failure___token"
    assert kwargs["extra"]["event_fields"]["body"] == "secret body"
    rendered = ol.RedactedJsonFormatter().format(
        _record(
            event_name=kwargs["extra"]["event_name"],
            fields=kwargs["extra"]["event_fields"],
        )
    )
    assert "secret body" not in rendered
    assert "abc123" not in rendered


def test_client_id_integer_is_emitted():
    payload = json.loads(
        ol.RedactedJsonFormatter().format(
            _record(
                fields={
                    "status": "failed",
                    "client_id": 42,
                }
            )
        )
    )
    assert payload["client_id"] == 42


def test_client_id_string_is_dropped():
    payload = json.loads(
        ol.RedactedJsonFormatter().format(
            _record(
                fields={
                    "status": "failed",
                    "client_id": "tenant-42",
                }
            )
        )
    )
    assert "client_id" not in payload
