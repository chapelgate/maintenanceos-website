from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

SAMPLE = "ghp_" + ("A" * 36)


def test_http_error_text_imports_and_redacts():
    redacted = sanitize_http_detail(f"leak {SAMPLE}")
    assert SAMPLE not in redacted
    assert "[REDACTED]" in redacted


def test_audit_text_imports_and_redacts():
    redacted = redact_detail(f"leak {SAMPLE}")
    assert SAMPLE not in redacted
    assert "[REDACTED]" in redacted


def test_operational_logging_imports_and_redacts():
    redacted = ol._redact(f"leak {SAMPLE}", "note")
    assert SAMPLE not in redacted
    assert "[REDACTED]" in redacted
