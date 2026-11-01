import pytest

from approval_text import bounded_approval_reason, bounded_proposed_action


def test_proposed_action_rejects_control_chars():
    with pytest.raises(ValueError, match="control"):
        bounded_proposed_action("dispatch\x00now")


def test_approval_reason_rejects_control_chars():
    with pytest.raises(ValueError, match="control"):
        bounded_approval_reason("needs\x01review")


def test_helpers_still_accept_clean_text():
    assert bounded_proposed_action("Dispatch contractor") == "Dispatch contractor"
    assert bounded_approval_reason("Verify identity") == "Verify identity"
