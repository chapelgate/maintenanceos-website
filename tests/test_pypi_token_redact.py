from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

PYPI = "pypi-" + ("A" * 40)
TOKENS = (PYPI,)


def test_http_redacts_pypi_token():
    redacted = sanitize_http_detail("tok " + PYPI)
    assert PYPI not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_pypi_token():
    redacted = redact_detail("tok " + PYPI)
    assert PYPI not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_pypi_token():
    redacted = ol._redact("tok " + PYPI, "note")
    assert PYPI not in redacted
    assert "[REDACTED]" in redacted
