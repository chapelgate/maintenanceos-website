import pytest
from unittest.mock import MagicMock

import action_evidence as ae


def test_record_action_result_rejects_action_key_control_chars():
    session = MagicMock()
    session.query.return_value.filter_by.return_value.first.return_value = None
    with pytest.raises(ValueError, match="control"):
        ae.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="repair_completed",
            action_key="k\x01ey",
            status="SUCCEEDED",
            actor="ops",
        )


def test_record_action_result_rejects_actor_control_chars():
    session = MagicMock()
    session.query.return_value.filter_by.return_value.first.return_value = None
    with pytest.raises(ValueError, match="control"):
        ae.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="repair_completed",
            action_key="k1",
            status="SUCCEEDED",
            actor="ops\x00",
        )


def test_record_action_result_accepts_clean():
    session = MagicMock()
    wo = MagicMock()
    wo.client_id = 1
    session.get.return_value = wo
    session.query.return_value.filter_by.return_value.first.return_value = None
    ae.record_action_result(
        session,
        client_id=1,
        work_order_id=1,
        action_type="repair_completed",
        action_key="k1",
        status="SUCCEEDED",
        actor="ops",
    )
    session.add.assert_called()
