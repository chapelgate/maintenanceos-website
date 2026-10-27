import inspect
from unittest.mock import patch

import decision_engine
import operations


def test_triage_category_max_covers_allowlist():
    assert operations.TRIAGE_CATEGORY_MAX == 64
    assert max(map(len, operations.TRIAGE_CATEGORIES)) <= operations.TRIAGE_CATEGORY_MAX
    assert max(map(len, decision_engine.CATEGORIES)) <= operations.TRIAGE_CATEGORY_MAX
    source = inspect.getsource(operations.resolve_triage)
    assert "TRIAGE_CATEGORY_MAX" in source
    assert "Plumbing" in operations.TRIAGE_CATEGORIES
    assert len("Plumbing") <= operations.TRIAGE_CATEGORY_MAX


def test_triage_category_rejects_overlong_before_allowlist():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong category")
        assert (
            operations.resolve_triage(
                1,
                1,
                "A" * (operations.TRIAGE_CATEGORY_MAX + 1),
                "Plumber",
                "P2",
                "enough reason text",
            )
            is False
        )


def test_triage_category_overlong_even_if_would_match_prefix():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong category")
        overlong = "Plumbing" + ("x" * operations.TRIAGE_CATEGORY_MAX)
        assert operations.resolve_triage(1, 1, overlong, "Plumber", "P2", "enough reason text") is False
