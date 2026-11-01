from secret_patterns import redact_secrets


def test_whsec_webhook_secret_is_redacted():
    raw = "stripe hook whsec_abcdefghijklmnopqrstuvwx used here"
    out = redact_secrets(raw)
    assert "whsec_" not in out
    assert "[REDACTED]" in out


def test_non_secret_text_unchanged():
    raw = "webhook endpoint ready"
    assert redact_secrets(raw) == raw
