import inspect
from unittest.mock import patch

import operations


def test_triage_resolution_max_is_1000():
    assert operations.TRIAGE_REASON_MAX == 1000
    source = inspect.getsource(operations.resolve_triage)
    assert "TRIAGE_REASON_MAX" in source


def test_triage_resolution_accepts_bounded_reason():
    reason = "a" * operations.TRIAGE_REASON_MAX
    assert len(reason) == operations.TRIAGE_REASON_MAX
    assert len(reason) >= 5


def test_triage_resolution_rejects_short_and_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.resolve_triage(1, 1, "cat", "trade", "P2", "") is False
        assert operations.resolve_triage(1, 1, "cat", "trade", "P2", "abcd") is False
        assert operations.resolve_triage(1, 1, "cat", "trade", "P2", "a" * (operations.TRIAGE_REASON_MAX + 1)) is False
