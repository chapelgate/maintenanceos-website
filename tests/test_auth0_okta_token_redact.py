from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

A1 = "auth0_" + ("A" * 30)
A2 = "auth0_" + ("B" * 30)
K1 = "okta_" + ("C" * 30)
K2 = "okta_" + ("D" * 30)
TOKENS = (A1, A2, K1, K2)


def test_http_redacts_auth0_okta_tokens():
    redacted = sanitize_http_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_auth0_okta_tokens():
    redacted = redact_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_auth0_okta_tokens():
    redacted = ol._redact("tok " + " ".join(TOKENS), "note")
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted
