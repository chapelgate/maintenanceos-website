from http_error_text import sanitize_http_detail
from audit_text import redact_detail
import operational_logging as ol

SENDGRID = "SG." + ("A" * 22) + "." + ("B" * 43)
GITLAB = "glpat-" + ("A" * 20)
HF = "hf_" + ("A" * 34)
MAILGUN = "key-" + ("a" * 32)
DO = "dop_v1_" + ("a" * 64)


def test_http_redacts_provider_tokens():
    redacted = sanitize_http_detail(f"tok {SENDGRID} {GITLAB} {HF} {MAILGUN} {DO}")
    for tok in (SENDGRID, GITLAB, HF, MAILGUN, DO):
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_provider_tokens():
    redacted = redact_detail(f"tok {SENDGRID} {GITLAB} {HF} {MAILGUN} {DO}")
    for tok in (SENDGRID, GITLAB, HF, MAILGUN, DO):
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_provider_tokens():
    redacted = ol._redact(f"tok {SENDGRID} {GITLAB} {HF} {MAILGUN} {DO}", "note")
    for tok in (SENDGRID, GITLAB, HF, MAILGUN, DO):
        assert tok not in redacted
    assert "[REDACTED]" in redacted
