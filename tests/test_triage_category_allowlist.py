import inspect
from unittest.mock import patch

import decision_engine
import operations


def test_triage_categories_match_decision_engine():
    assert operations.TRIAGE_CATEGORIES == frozenset(decision_engine.CATEGORIES)
    source = inspect.getsource(operations.resolve_triage)
    assert "TRIAGE_CATEGORIES" in source


def test_triage_accepts_known_category():
    assert "Plumbing" in operations.TRIAGE_CATEGORIES
    assert "Unknown" not in operations.TRIAGE_CATEGORIES


def test_triage_rejects_unknown_category():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for category rejects")
        assert operations.resolve_triage(1, 1, "Unknown", "General", "P2", "enough reason text") is False
        assert operations.resolve_triage(1, 1, "NotACategory", "General", "P2", "enough reason text") is False
        assert operations.resolve_triage(1, 1, "", "Plumber", "P2", "enough reason text") is False
