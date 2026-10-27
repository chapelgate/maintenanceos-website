import operational_logging as ol


def test_ops_log_redacts_google_api_key():
    raw = "provider key AIzaSyA-test-key-1234567890 leaked"
    redacted = ol._redact(raw, "reason_code")
    assert "AIzaSyA-test-key-1234567890" not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_keeps_plain_reason():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
