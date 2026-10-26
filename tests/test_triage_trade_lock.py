import inspect
from unittest.mock import patch

import decision_engine
import operations


def test_triage_trade_uses_decision_engine_trade():
    source = inspect.getsource(operations.resolve_triage)
    assert "TRADE" in source
    assert "TRADE.get" in source
    assert decision_engine.TRADE["Plumbing"] == "Plumber"


def test_triage_accepts_matching_trade():
    assert decision_engine.TRADE["Heating"] == "Heating Engineer"
    assert operations.TRADE["Electrical"] == "Electrician"


def test_triage_rejects_mismatched_trade():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for trade rejects")
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "Electrician", "P2", "enough reason text"
            )
            is False
        )
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "General", "P2", "enough reason text"
            )
            is False
        )
        assert (
            operations.resolve_triage(1, 1, "Plumbing", "", "P2", "enough reason text")
            is False
        )
