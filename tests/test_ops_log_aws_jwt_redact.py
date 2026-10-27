import operational_logging as ol


def test_ops_log_redacts_aws_access_keys_and_jwt():
    jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturepart"
    raw = f"creds AKIA0123456789ABCDEF ASIA0123456789ABCDEF token {jwt}"
    redacted = ol._redact(raw, "reason_code")
    assert "AKIA0123456789ABCDEF" not in redacted
    assert "ASIA0123456789ABCDEF" not in redacted
    assert jwt not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_keeps_non_secret_reason_code():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
