from unittest.mock import MagicMock

import pytest

import lifecycle
from models import WorkOrder


def _wo(status="NEW"):
    wo = WorkOrder()
    wo.id = 1
    wo.status = status
    wo.updated_at = None
    wo.closed_at = None
    return wo


def test_transition_reason_max_is_1000():
    assert lifecycle.TRANSITION_REASON_MAX == 1000
    assert lifecycle.TRANSITION_ACTOR_MAX == 100
    assert lifecycle.TRANSITION_AUDIT_DETAIL_MAX == 8000


def test_transition_rejects_overlong_reason_before_mutate():
    session = MagicMock()
    session.query.return_value.filter_by.return_value.first.return_value = None
    wo = _wo("READY_FOR_DISPATCH")
    with pytest.raises(ValueError, match="transition reason invalid"):
        lifecycle.transition_work_order(
            session,
            wo,
            "HUMAN_REVIEW",
            actor="Decision Engine",
            reason="r" * (lifecycle.TRANSITION_REASON_MAX + 1),
        )
    assert wo.status == "READY_FOR_DISPATCH"
    session.add.assert_not_called()


def test_transition_rejects_blank_actor_before_mutate():
    session = MagicMock()
    wo = _wo("READY_FOR_DISPATCH")
    with pytest.raises(ValueError, match="transition actor invalid"):
        lifecycle.transition_work_order(
            session,
            wo,
            "HUMAN_REVIEW",
            actor="  ",
            reason="ok reason",
        )
    assert wo.status == "READY_FOR_DISPATCH"
    session.add.assert_not_called()


def test_transition_redacts_secrets_in_audit_detail():
    session = MagicMock()
    wo = _wo("READY_FOR_DISPATCH")
    lifecycle.transition_work_order(
        session,
        wo,
        "HUMAN_REVIEW",
        actor="Decision Engine",
        reason="escalate Bearer sk-live-ABCDEFGH1234 for +441512345678",
    )
    assert wo.status == "HUMAN_REVIEW"
    event = session.add.call_args.args[0]
    assert "Bearer [REDACTED]" in event.detail
    assert "[REDACTED]" in event.detail
    assert "sk-live" not in event.detail
    assert "+441512345678" not in event.detail
