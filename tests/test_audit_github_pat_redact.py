from audit_text import redact_detail


def test_audit_redacts_github_pat():
    raw = "token ghp_abcdefghijklmnopqrstuvwxyz0123456789 leaked"
    redacted = redact_detail(raw)
    assert "ghp_abcdefghijklmnopqrstuvwxyz0123456789" not in redacted
    assert "[REDACTED]" in redacted


def test_audit_keeps_lifecycle_ids_with_github_pat():
    raw = '{"client_id": 42, "note": "ghp_abcdefghijklmnopqrstuvwxyz0123456789"}'
    redacted = redact_detail(raw)
    assert '"client_id": 42' in redacted
    assert "ghp_abcdefghijklmnopqrstuvwxyz0123456789" not in redacted
