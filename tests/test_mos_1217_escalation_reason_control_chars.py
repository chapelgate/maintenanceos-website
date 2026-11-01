import pytest

from escalation_text import bounded_escalation_reason


def test_escalation_reason_rejects_control_chars():
    with pytest.raises(ValueError, match="control"):
        bounded_escalation_reason("urgent\x00escalation")


def test_escalation_reason_accepts_clean_text():
    assert bounded_escalation_reason("Resident at risk") == "Resident at risk"


def test_escalation_reason_rejects_empty():
    with pytest.raises(ValueError, match="invalid"):
        bounded_escalation_reason("   ")
