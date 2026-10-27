from audit_text import redact_detail


def test_audit_redacts_google_api_key():
    raw = "provider key AIzaSyA-test-key-1234567890 leaked"
    redacted = redact_detail(raw)
    assert "AIzaSyA-test-key-1234567890" not in redacted
    assert "[REDACTED]" in redacted


def test_audit_keeps_lifecycle_ids_with_google_key():
    raw = '{"client_id": 42, "note": "AIzaSyA-test-key-1234567890"}'
    redacted = redact_detail(raw)
    assert '"client_id": 42' in redacted
    assert "AIzaSyA-test-key-1234567890" not in redacted
