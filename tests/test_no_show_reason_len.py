import inspect
from unittest.mock import patch

import operations


def test_no_show_reason_max_is_1000():
    assert operations.NO_SHOW_REASON_MAX == 1000
    source = inspect.getsource(operations.record_no_show)
    assert "NO_SHOW_REASON_MAX" in source


def test_no_show_reason_accepts_bounded_reason():
    reason = "a" * operations.NO_SHOW_REASON_MAX
    assert len(reason) == operations.NO_SHOW_REASON_MAX
    assert len(reason) >= 5


def test_no_show_reason_rejects_short_and_overlong():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for length rejects")
        assert operations.record_no_show(1, 1, "") is False
        assert operations.record_no_show(1, 1, "abcd") is False
        assert operations.record_no_show(1, 1, "a" * (operations.NO_SHOW_REASON_MAX + 1)) is False
