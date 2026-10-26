import inspect
from unittest.mock import patch

import operations


def test_reject_reason_max_is_1000():
    assert operations.REJECT_REASON_MAX == 1000
    source = inspect.getsource(operations.reject_operational_action)
    assert "REJECT_REASON_MAX" in source


def test_reject_reason_accepts_bounded_reason():
    reason = "a" * operations.REJECT_REASON_MAX
    assert len(reason) == operations.REJECT_REASON_MAX
    assert len(reason) >= 5


def test_reject_reason_rejects_short_and_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.reject_operational_action(1, 1, "") is False
        assert operations.reject_operational_action(1, 1, "abcd") is False
        assert operations.reject_operational_action(1, 1, "a" * (operations.REJECT_REASON_MAX + 1)) is False
