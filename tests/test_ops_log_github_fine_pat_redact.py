import operational_logging as ol

FINE = "github_pat_11ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz0123456789ABCD"


def test_ops_log_redacts_github_fine_pat():
    redacted = ol._redact(f"token {FINE} leaked", "reason_code")
    assert FINE not in redacted
    assert "github_pat_" not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_keeps_plain_reason():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
