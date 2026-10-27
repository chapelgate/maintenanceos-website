from audit_text import redact_detail

FINE = "github_pat_11ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz0123456789ABCD"


def test_audit_redacts_github_fine_pat():
    redacted = redact_detail(f"token {FINE} leaked")
    assert FINE not in redacted
    assert "github_pat_" not in redacted
    assert "[REDACTED]" in redacted


def test_audit_keeps_lifecycle_ids_with_github_fine_pat():
    redacted = redact_detail(f'{{"client_id": 42, "note": "{FINE}"}}')
    assert '"client_id": 42' in redacted
    assert FINE not in redacted
