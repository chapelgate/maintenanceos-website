import operational_logging as ol

PAT = "ghp_" + ("A" * 36)


def test_ops_log_redacts_github_pat():
    redacted = ol._redact(f"token {PAT} leaked", "reason_code")
    assert PAT not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_keeps_plain_reason():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
