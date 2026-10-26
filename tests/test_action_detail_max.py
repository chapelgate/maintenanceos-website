import inspect
from unittest.mock import MagicMock

import pytest

import action_evidence


def test_action_detail_max_is_4000():
    assert action_evidence.DETAIL_MAX == 4000
    source = inspect.getsource(action_evidence.record_action_result)
    assert "DETAIL_MAX" in source


def test_action_detail_accepts_bounded_text():
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
        action_key="synthetic-key",
        status="SUCCEEDED",
        actor="Synthetic",
        detail="d" * action_evidence.DETAIL_MAX,
    )
    assert result is not None
    session.add.assert_called()


def test_action_detail_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Action detail exceeds maximum length"):
        action_evidence.record_action_result(
            session,
            client_id=1,
            work_order_id=1,
            action_type="contractor_contacted",
            action_key="synthetic-key",
            status="SUCCEEDED",
            actor="Synthetic",
            detail="d" * (action_evidence.DETAIL_MAX + 1),
        )
    session.get.assert_not_called()
