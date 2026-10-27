import inspect
from unittest.mock import MagicMock

import pytest

import action_evidence


def test_action_type_max_is_64():
    assert action_evidence.ACTION_TYPE_MAX == 64
    assert max(map(len, action_evidence.CONFIRMABLE_ACTIONS)) <= action_evidence.ACTION_TYPE_MAX
    source = inspect.getsource(action_evidence.record_action_result)
    assert "ACTION_TYPE_MAX" in source


def test_action_type_accepts_allowlisted():
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
        action_key="synthetic-type-key",
        status="SUCCEEDED",
        actor="Synthetic",
    )
    assert result is not None


def test_action_type_rejects_overlong_before_allowlist():
    session = MagicMock()
    with pytest.raises(ValueError, match="Action type exceeds maximum length"):
        action_evidence.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="a" * (action_evidence.ACTION_TYPE_MAX + 1),
            action_key="overlong-type",
            status="SUCCEEDED",
            actor="Synthetic",
        )
    session.get.assert_not_called()
