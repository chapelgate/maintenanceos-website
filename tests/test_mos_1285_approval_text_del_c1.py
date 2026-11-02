import pytest

from approval_text import bounded_approval_reason, bounded_proposed_action


def test_proposed_action_rejects_del_and_c1():
    with pytest.raises(ValueError, match="control"):
        bounded_proposed_action("dispatch\x7fnow")
    with pytest.raises(ValueError, match="control"):
        bounded_proposed_action("dispatch\x80now")


def test_approval_reason_rejects_del_and_c1():
    with pytest.raises(ValueError, match="control"):
        bounded_approval_reason("needs\x7freview")
    with pytest.raises(ValueError, match="control"):
        bounded_approval_reason("needs\x9freview")


def test_helpers_accept_clean_and_whitespace_controls():
    assert bounded_proposed_action("Dispatch contractor") == "Dispatch contractor"
    assert bounded_approval_reason("Verify\nidentity\tnow") == "Verify\nidentity\tnow"
