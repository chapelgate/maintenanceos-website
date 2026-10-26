import inspect
from unittest.mock import patch

import operations


def test_approval_reason_max_is_1000():
    assert operations.APPROVAL_REASON_MAX == 1000
    source = inspect.getsource(operations.approve_operational_action)
    assert "APPROVAL_REASON_MAX" in source


def test_approval_reason_accepts_bounded_reason():
    reason = "a" * operations.APPROVAL_REASON_MAX
    assert len(reason) == operations.APPROVAL_REASON_MAX
    assert len(reason) >= 5


def test_approval_reason_rejects_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.approve_operational_action(1, 1, "a" * (operations.APPROVAL_REASON_MAX + 1)) is False
