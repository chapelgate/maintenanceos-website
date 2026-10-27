import inspect
from unittest.mock import patch

import decision_engine
import operations


def test_triage_trade_max_covers_allowlist():
    assert operations.TRIAGE_TRADE_MAX == 64
    assert max(map(len, operations.TRADE.values())) <= operations.TRIAGE_TRADE_MAX
    assert max(map(len, decision_engine.TRADE.values())) <= operations.TRIAGE_TRADE_MAX
    source = inspect.getsource(operations.resolve_triage)
    assert "TRIAGE_TRADE_MAX" in source
    assert "Plumber" in operations.TRADE.values()
    assert len("Plumber") <= operations.TRIAGE_TRADE_MAX


def test_triage_trade_rejects_overlong_before_allowlist():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong trade")
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "A" * (operations.TRIAGE_TRADE_MAX + 1), "P2", "enough reason text"
            )
            is False
        )


def test_triage_trade_rejects_overlong_prefixed_known_trade():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong trade")
        overlong = "Plumber" + ("x" * operations.TRIAGE_TRADE_MAX)
        assert operations.resolve_triage(1, 1, "Plumbing", overlong, "P2", "enough reason text") is False
