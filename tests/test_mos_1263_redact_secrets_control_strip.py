from secret_patterns import redact_secrets


def test_redact_secrets_strips_c0_controls():
    out = redact_secrets("pre\x00Bearer sk-abcdefghijklmnop post\x01")
    assert "\x00" not in out
    assert "\x01" not in out
    assert "[REDACTED]" in out
    assert "sk-abcdefghijklmnop" not in out


def test_redact_secrets_keeps_tab_and_newline():
    out = redact_secrets("a\tb\nc")
    assert out == "a\tb\nc"


def test_redact_secrets_still_redacts_email():
    out = redact_secrets("mail user@example.com")
    assert "user@example.com" not in out
    assert "[REDACTED]" in out
