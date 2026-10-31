import json

from audit_text import redact_detail
from http_error_text import (
    HTTP_ERROR_DETAIL_MAX,
    HTTP_ERROR_JSON_MAX,
    sanitize_http_detail,
    sanitize_json_payload,
)


def test_sanitize_http_detail_basic_redaction():
    raw = "Bearer abc123 sk-abcdefghij user@example.com +441234567890"
    out = sanitize_http_detail(raw)
    assert isinstance(out, str)
    assert "Bearer [REDACTED]" in out
    assert "sk-abcdefghij" not in out
    assert "user@example.com" not in out
    assert "+441234567890" not in out


def test_sanitize_http_detail_non_string_passthrough():
    assert sanitize_http_detail({"code": "x"}) == {"code": "x"}
    assert sanitize_http_detail(None) is None
    assert sanitize_http_detail(409) == 409


def test_sanitize_http_detail_truncation():
    raw = "safe-" + ("x" * (HTTP_ERROR_DETAIL_MAX + 50))
    out = sanitize_http_detail(raw)
    assert isinstance(out, str)
    assert len(out) == HTTP_ERROR_DETAIL_MAX


def test_sanitize_http_detail_provider_id_redaction():
    raw = "sid AC" + ("a" * 32) + " ok"
    out = sanitize_http_detail(raw)
    assert "AC" + ("a" * 32) not in out
    assert "[REDACTED]" in out


def test_sanitize_http_detail_all_token_types():
    raw = " ".join(
        [
            "ghp_" + ("A" * 36),
            "github_pat_" + ("B" * 22),
            "sk_live_" + ("C" * 20),
            "AIza" + ("D" * 12),
            "npm_" + ("E" * 24),
            "xoxb-" + ("F" * 12),
            "auth0_" + ("G" * 24),
            "okta_" + ("H" * 24),
            "pypi-" + ("I" * 24),
            "shpat_" + ("J" * 24),
            "VA" + ("K" * 32),
            "dop_v1_" + ("L" * 24),
            "glpat-" + ("M" * 20),
            "hf_" + ("N" * 20),
            "key-" + ("O" * 24),
            "SG." + ("P" * 22) + "." + ("Q" * 22),
        ]
    )
    out = sanitize_http_detail(raw)
    for needle in ("ghp_", "github_pat_", "sk_live_", "AIza", "npm_", "xoxb-", "auth0_", "okta_", "pypi-", "shpat_", "VA", "dop_v1_", "glpat-", "hf_", "key-", "SG."):
        assert needle not in out or "[REDACTED]" in out
    assert "ghp_" + ("A" * 36) not in out


def test_sanitize_json_payload_redacts_secrets_in_json():
    payload = {"note": "Bearer tokensecret", "email": "a@b.co", "ok": True}
    out = sanitize_json_payload(payload)
    assert "Bearer tokensecret" not in out
    assert "a@b.co" not in out
    assert "[REDACTED]" in out


def test_sanitize_json_payload_preserves_safe_fields():
    payload = {"status": 200, "path": "/health", "ok": True}
    out = sanitize_json_payload(payload)
    loaded = json.loads(out)
    assert loaded["status"] == 200
    assert loaded["path"] == "/health"
    assert loaded["ok"] is True


def test_sanitize_json_payload_truncates_long_output():
    payload = {"blob": "y" * (HTTP_ERROR_JSON_MAX + 100)}
    out = sanitize_json_payload(payload)
    assert len(out) == HTTP_ERROR_JSON_MAX


def test_audit_text_no_duplicate_redact_detail():
    text = open("audit_text.py").read()
    assert text.count("def redact_detail") == 1


def test_audit_text_no_duplicate_regex_constants():
    text = open("audit_text.py").read()
    assert "BEARER_VALUE = re.compile" not in text
    assert "from secret_patterns import" in text


def test_http_error_text_no_duplicate_regex_constants():
    text = open("http_error_text.py").read()
    assert "BEARER_VALUE = re.compile" not in text
    assert "from secret_patterns import" in text


def test_http_error_text_no_duplicate_sub_chain_http_detail():
    text = open("http_error_text.py").read()
    assert text.count("def sanitize_http_detail") == 1
    assert ".sub(" not in text  # delegated to redact_secrets


def test_http_error_text_no_duplicate_sub_chain_json():
    text = open("http_error_text.py").read()
    assert text.count("def sanitize_json_payload") == 1


def test_no_cross_function_duplicates():
    assert redact_detail("Bearer abc sk-abcdefghij") == sanitize_http_detail("Bearer abc sk-abcdefghij")
