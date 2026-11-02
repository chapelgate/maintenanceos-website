from unittest.mock import MagicMock

import pytest

import action_evidence as ae


def test_helper_rejects_del_and_c1():
    assert ae._has_control_chars("clean") is False
    assert ae._has_control_chars("a" + chr(0x7F)) is True
    assert ae._has_control_chars("a" + chr(0x80)) is True
    assert ae._has_control_chars("a" + chr(0x9F)) is True
    assert ae._has_control_chars("a" + chr(0)) is True
    assert ae._has_control_chars("ok\t\n\r", allow_whitespace_controls=True) is False
    assert ae._has_control_chars("bad" + chr(0x7F), allow_whitespace_controls=True) is True


def test_record_action_result_rejects_del_and_c1_in_action_key():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        ae.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="repair_completed",
            action_key="k" + chr(0x7F),
            status="SUCCEEDED",
            actor="ops",
            detail="done",
        )
    with pytest.raises(ValueError, match="control"):
        ae.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="repair_completed",
            action_key="k" + chr(0x80),
            status="SUCCEEDED",
            actor="ops",
            detail="done",
        )


def test_record_action_result_rejects_del_and_c1_in_actor_and_detail():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        ae.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="repair_completed",
            action_key="k1",
            status="SUCCEEDED",
            actor="ops" + chr(0x7F),
            detail="done",
        )
    with pytest.raises(ValueError, match="control"):
        ae.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="repair_completed",
            action_key="k1",
            status="SUCCEEDED",
            actor="ops",
            detail="done" + chr(0x80),
        )
