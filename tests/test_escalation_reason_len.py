import inspect
from unittest.mock import patch

import operations


def test_escalation_resolution_max_is_1000():
    assert operations.ESCALATION_RESOLUTION_MAX == 1000
    source = inspect.getsource(operations.resolve_escalation)
    assert "ESCALATION_RESOLUTION_MAX" in source


def test_escalation_resolution_accepts_bounded_reason():
    reason = "a" * operations.ESCALATION_RESOLUTION_MAX
    assert len(reason) == operations.ESCALATION_RESOLUTION_MAX
    assert len(reason) >= 5


def test_escalation_resolution_rejects_short_and_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.resolve_escalation(1, 1, "") is False
        assert operations.resolve_escalation(1, 1, "abcd") is False
        assert operations.resolve_escalation(1, 1, "a" * (operations.ESCALATION_RESOLUTION_MAX + 1)) is False
