import inspect
from unittest.mock import MagicMock

import pytest

import action_evidence


def test_action_actor_max_is_100():
    assert action_evidence.ACTION_ACTOR_MAX == 100
    source = inspect.getsource(action_evidence.record_action_result)
    assert "ACTION_ACTOR_MAX" in source


def _session_for_record():
    session = MagicMock()
    session.get.return_value = MagicMock(client_id=1)
    session.query.return_value.filter_by.return_value.first.return_value = None
    nested = MagicMock()
    nested.__enter__ = MagicMock(return_value=None)
    nested.__exit__ = MagicMock(return_value=False)
    session.begin_nested.return_value = nested
    return session


def test_action_actor_accepts_bounded_text():
    session = _session_for_record()
    result = action_evidence.record_action_result(
        session,
        client_id=1,
        work_order_id=1,
        action_type="contractor_contacted",
        action_key="synthetic-actor-key",
        status="SUCCEEDED",
        actor="a" * action_evidence.ACTION_ACTOR_MAX,
    )
    assert result is not None
    session.add.assert_called()


def test_action_actor_rejects_blank():
    session = MagicMock()
    with pytest.raises(ValueError, match="Action actor invalid"):
        action_evidence.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="contractor_contacted",
            action_key="blank-actor",
            status="SUCCEEDED",
            actor="   ",
        )
    session.get.assert_not_called()


def test_action_actor_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Action actor invalid"):
        action_evidence.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="contractor_contacted",
            action_key="overlong-actor",
            status="SUCCEEDED",
            actor="a" * (action_evidence.ACTION_ACTOR_MAX + 1),
        )
    session.get.assert_not_called()
