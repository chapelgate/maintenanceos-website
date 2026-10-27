from audit_text import redact_detail


def test_audit_redacts_aws_access_keys_and_jwt():
    jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signaturepart"
    raw = f"creds AKIA0123456789ABCDEF ASIA0123456789ABCDEF token {jwt}"
    redacted = redact_detail(raw)
    assert "AKIA0123456789ABCDEF" not in redacted
    assert "ASIA0123456789ABCDEF" not in redacted
    assert jwt not in redacted
    assert "[REDACTED]" in redacted


def test_audit_keeps_lifecycle_ids_with_aws_jwt_patterns():
    raw = '{"client_id": 42, "note": "AKIA0123456789ABCDEF"}'
    redacted = redact_detail(raw)
    assert '"client_id": 42' in redacted
    assert "AKIA0123456789ABCDEF" not in redacted
