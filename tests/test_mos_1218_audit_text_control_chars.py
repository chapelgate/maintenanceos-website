import pytest

from audit_text import redact_detail


def test_redact_detail_rejects_control_chars():
    with pytest.raises(ValueError, match="control"):
        redact_detail("audit\x00detail")


def test_redact_detail_still_redacts_secrets():
    out = redact_detail("email resident@example.test Bearer token")
    assert "resident@example.test" not in out
    assert "[REDACTED]" in out


def test_redact_detail_allows_newlines():
    assert redact_detail("line1\\nline2") == redact_detail("line1\\nline2")
