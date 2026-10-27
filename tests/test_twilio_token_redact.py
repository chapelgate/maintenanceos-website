from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

T1 = "VA" + ("A" * 32)
T2 = "VA" + ("B" * 32)
TOKENS = (T1, T2)


def test_http_redacts_twilio_tokens():
    redacted = sanitize_http_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_twilio_tokens():
    redacted = redact_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_twilio_tokens():
    redacted = ol._redact("tok " + " ".join(TOKENS), "note")
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted
