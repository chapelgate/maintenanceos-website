from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

KEY = "key-" + ("a" * 32)


def test_http_redacts_mailgun_key():
    redacted = sanitize_http_detail(f"tok {KEY}")
    assert KEY not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_mailgun_key():
    redacted = redact_detail(f"tok {KEY}")
    assert KEY not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_mailgun_key():
    redacted = ol._redact(f"tok {KEY}", "note")
    assert KEY not in redacted
    assert "[REDACTED]" in redacted
