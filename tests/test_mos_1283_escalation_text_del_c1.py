import pytest

from escalation_text import bounded_escalation_reason


def test_escalation_reason_rejects_del():
    with pytest.raises(ValueError, match="control"):
        bounded_escalation_reason("urgent\x7fescalation")


def test_escalation_reason_rejects_c1():
    with pytest.raises(ValueError, match="control"):
        bounded_escalation_reason("urgent\x80escalation")
    with pytest.raises(ValueError, match="control"):
        bounded_escalation_reason("urgent\x9fescalation")


def test_escalation_reason_accepts_clean_and_whitespace_controls():
    assert bounded_escalation_reason("Resident at risk") == "Resident at risk"
    assert bounded_escalation_reason("line1\nline2\tnote") == "line1\nline2\tnote"
