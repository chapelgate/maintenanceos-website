from audit_text import redact_detail
from http_error_text import sanitize_http_detail
import operational_logging as ol

SG = "SG." + ("A" * 22) + "." + ("B" * 43)
DO = "dop_v1_" + ("a" * 64)
GL = "glpat-" + ("A" * 20)
HF = "hf_" + ("A" * 34)
TOKENS = (SG, DO, GL, HF)


def test_http_redacts_provider_tokens():
    redacted = sanitize_http_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_audit_redacts_provider_tokens():
    redacted = redact_detail("tok " + " ".join(TOKENS))
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_redacts_provider_tokens():
    redacted = ol._redact("tok " + " ".join(TOKENS), "note")
    for tok in TOKENS:
        assert tok not in redacted
    assert "[REDACTED]" in redacted
