import inspect
from unittest.mock import patch

import operations


def test_reopen_reason_max_is_1000():
    assert operations.REOPEN_REASON_MAX == 1000
    source = inspect.getsource(operations.reopen_work_order)
    assert "REOPEN_REASON_MAX" in source


def test_reopen_reason_accepts_bounded_reason():
    reason = "a" * operations.REOPEN_REASON_MAX
    assert len(reason) == operations.REOPEN_REASON_MAX
    assert len(reason) >= 5


def test_reopen_reason_rejects_short_and_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.reopen_work_order(1, 1, "") is False
        assert operations.reopen_work_order(1, 1, "abcd") is False
        assert operations.reopen_work_order(1, 1, "a" * (operations.REOPEN_REASON_MAX + 1)) is False
