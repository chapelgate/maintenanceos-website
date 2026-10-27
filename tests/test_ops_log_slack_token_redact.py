import operational_logging as ol

TOKEN = "xoxb-1234567890-abcdefghij"


def test_ops_log_redacts_slack_token():
    redacted = ol._redact(f"bot {TOKEN} leaked", "reason_code")
    assert TOKEN not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_keeps_plain_reason():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
