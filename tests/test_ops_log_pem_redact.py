import operational_logging as ol

PEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC\n-----END PRIVATE KEY-----"


def test_ops_log_redacts_pem_private_key():
    redacted = ol._redact(f"key material {PEM} leaked", "reason_code")
    assert "BEGIN PRIVATE KEY" not in redacted
    assert "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC" not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_keeps_plain_reason():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
