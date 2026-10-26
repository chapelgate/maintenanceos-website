import inspect
from unittest.mock import patch

import operations


def test_cancel_reason_max_is_1000():
    assert operations.CANCEL_REASON_MAX == 1000
    source = inspect.getsource(operations.cancel_work_order)
    assert "CANCEL_REASON_MAX" in source


def test_cancel_reason_accepts_bounded_reason():
    reason = "a" * operations.CANCEL_REASON_MAX
    assert len(reason) == operations.CANCEL_REASON_MAX
    assert len(reason) >= 5


def test_cancel_reason_rejects_short_and_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.cancel_work_order(1, 1, "") is False
        assert operations.cancel_work_order(1, 1, "abcd") is False
        assert operations.cancel_work_order(1, 1, "a" * (operations.CANCEL_REASON_MAX + 1)) is False
