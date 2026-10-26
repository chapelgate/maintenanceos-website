import inspect
from unittest.mock import MagicMock

import pytest

import action_evidence


def test_action_key_max_is_200():
    assert action_evidence.ACTION_KEY_MAX == 200
    source = inspect.getsource(action_evidence.record_action_result)
    assert "ACTION_KEY_MAX" in source


def test_action_key_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock(client_id=1)
    session.query.return_value.filter_by.return_value.first.return_value = None
    nested = MagicMock()
    nested.__enter__ = MagicMock(return_value=None)
    nested.__exit__ = MagicMock(return_value=False)
    session.begin_nested.return_value = nested
    result = action_evidence.record_action_result(
        session,
        client_id=1,
        work_order_id=1,
        action_type="contractor_contacted",
        action_key="a" * action_evidence.ACTION_KEY_MAX,
        status="SUCCEEDED",
        actor="Synthetic",
    )
    assert result is not None
    session.add.assert_called()


def test_action_key_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Action key exceeds maximum length"):
        action_evidence.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="contractor_contacted",
            action_key="a" * (action_evidence.ACTION_KEY_MAX + 1),
            status="SUCCEEDED",
            actor="Synthetic",
        )
    session.get.assert_not_called()
