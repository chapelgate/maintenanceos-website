from audit_text import redact_detail

PEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC\n-----END PRIVATE KEY-----"


def test_audit_redacts_pem_private_key():
    redacted = redact_detail(f"key material {PEM} leaked")
    assert "BEGIN PRIVATE KEY" not in redacted
    assert "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC" not in redacted
    assert "[REDACTED]" in redacted


def test_audit_keeps_lifecycle_ids_with_pem():
    redacted = redact_detail(f'{{"client_id": 42, "note": "{PEM}"}}')
    assert '"client_id": 42' in redacted
    assert "BEGIN PRIVATE KEY" not in redacted
