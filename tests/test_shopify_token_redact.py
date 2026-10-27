from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

SHPAT = "shpat_" + ("a" * 32)
SHPSS = "shpss_" + ("b" * 32)
SHPCA = "shpca_" + ("c" * 32)
SHPPA = "shppa_" + ("d" * 32)
TOKENS = (SHPAT, SHPSS, SHPCA, SHPPA)


def test_http_redacts_shopify_tokens():
    redacted = sanitize_http_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_shopify_tokens():
    redacted = redact_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_shopify_tokens():
    redacted = ol._redact("tok " + " ".join(TOKENS), "note")
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted
