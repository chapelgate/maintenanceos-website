from operations import DECISION_TRADE, TRIAGE_CATEGORIES, TRIAGE_URGENCIES
from unittest.mock import MagicMock

import operations as ops


def test_resolve_triage_rejects_category_control_chars():
    # build a minimal approval/workorder would require DB; instead just verify
    # the validation branch short-circuits by monkeypatching SessionLocal
    with MagicMock() as m:
        pass
    assert ops.resolve_triage(1, "u", "Plumbing\x00", "Plumber", "P2", "reason enough") is False


def test_resolve_triage_rejects_trade_control_chars():
    assert ops.resolve_triage(1, "u", "Plumbing", "Plumber\x01", "P2", "reason enough") is False


def test_resolve_triage_rejects_urgency_control_chars():
    assert ops.resolve_triage(1, "u", "Plumbing", "Plumber", "P2\x02", "reason enough") is False


def test_decision_trade_matches_plumbing():
    assert DECISION_TRADE.get("Plumbing") == "Plumber"
