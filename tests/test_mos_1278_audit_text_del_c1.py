import pytest

from audit_text import redact_detail


def test_redact_detail_rejects_del():
    with pytest.raises(ValueError, match="control"):
        redact_detail("audit\x7fdetail")


def test_redact_detail_rejects_c1():
    with pytest.raises(ValueError, match="control"):
        redact_detail("audit\x80detail")
    with pytest.raises(ValueError, match="control"):
        redact_detail("audit\x9fdetail")


def test_redact_detail_still_allows_tab_newline_and_redacts():
    out = redact_detail("line1\nBearer sk-abcdefghijklmnop\tok")
    assert "\n" in out
    assert "\t" in out
    assert "[REDACTED]" in out
    assert "sk-abcdefghijklmnop" not in out
