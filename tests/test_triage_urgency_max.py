import inspect
from unittest.mock import patch

import operations


def test_triage_urgency_max_covers_allowlist():
    assert operations.TRIAGE_URGENCY_MAX == 2
    assert max(map(len, operations.TRIAGE_URGENCIES)) <= operations.TRIAGE_URGENCY_MAX
    source = inspect.getsource(operations.resolve_triage)
    assert "TRIAGE_URGENCY_MAX" in source


def test_triage_urgency_rejects_overlong_before_allowlist():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong urgency")
        assert (
            operations.resolve_triage(
                1, 1, "Plumbing", "Plumber", "A" * (operations.TRIAGE_URGENCY_MAX + 1), "enough reason text"
            )
            is False
        )


def test_triage_urgency_rejects_overlong_prefixed_known():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong urgency")
        overlong = "P2" + ("x" * operations.TRIAGE_URGENCY_MAX)
        assert operations.resolve_triage(1, 1, "Plumbing", "Plumber", overlong, "enough reason text") is False
