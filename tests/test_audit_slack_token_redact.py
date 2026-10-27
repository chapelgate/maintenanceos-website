from audit_text import redact_detail


def test_audit_redacts_slack_token():
    raw = "bot xoxb-1234567890-abcdefghij leaked"
    redacted = redact_detail(raw)
    assert "xoxb-1234567890-abcdefghij" not in redacted
    assert "[REDACTED]" in redacted


def test_audit_keeps_lifecycle_ids_with_slack_token():
    raw = '{"client_id": 42, "note": "xoxb-1234567890-abcdefghij"}'
    redacted = redact_detail(raw)
    assert '"client_id": 42' in redacted
    assert "xoxb-1234567890-abcdefghij" not in redacted
