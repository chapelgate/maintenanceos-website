import inspect
from unittest.mock import MagicMock

import pytest

import action_evidence


def test_action_status_max_is_16():
    assert action_evidence.ACTION_STATUS_MAX == 16
    assert max(map(len, action_evidence.ACTION_STATES)) <= action_evidence.ACTION_STATUS_MAX
    source = inspect.getsource(action_evidence.record_action_result)
    assert "ACTION_STATUS_MAX" in source


def test_action_status_accepts_allowlisted():
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
        action_key="synthetic-status-key",
        status="SUCCEEDED",
        actor="Synthetic",
    )
    assert result is not None


def test_action_status_rejects_overlong_before_allowlist():
    session = MagicMock()
    with pytest.raises(ValueError, match="Action status exceeds maximum length"):
        action_evidence.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="contractor_contacted",
            action_key="overlong-status",
            status="A" * (action_evidence.ACTION_STATUS_MAX + 1),
            actor="Synthetic",
        )
    session.get.assert_not_called()
