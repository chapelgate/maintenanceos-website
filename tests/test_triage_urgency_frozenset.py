import inspect
from unittest.mock import patch

import operations


def test_triage_urgencies_known_set():
    assert operations.TRIAGE_URGENCIES == frozenset({"P2", "P3"})
    source = inspect.getsource(operations.resolve_triage)
    assert "TRIAGE_URGENCIES" in source


def test_triage_accepts_allowed_urgency():
    assert "P2" in operations.TRIAGE_URGENCIES
    assert "P3" in operations.TRIAGE_URGENCIES
    assert "P1" not in operations.TRIAGE_URGENCIES


def test_triage_rejects_unknown_urgency():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for urgency rejects")
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "Plumber", "P1", "enough reason text"
            )
            is False
        )
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "Plumber", "P9", "enough reason text"
            )
            is False
        )
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "Plumber", "", "enough reason text"
            )
            is False
        )
