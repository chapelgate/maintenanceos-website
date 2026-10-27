import inspect
from unittest.mock import patch

import operations


def test_ops_resident_comment_max_is_4000():
    assert operations.RESIDENT_COMMENT_MAX == 4000
    source = inspect.getsource(operations.resident_confirmation)
    assert "RESIDENT_COMMENT_MAX" in source


def test_ops_resident_comment_accepts_bounded_text():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded comment must open session")
        try:
            operations.resident_confirmation(1, True, "c" * operations.RESIDENT_COMMENT_MAX)
        except AssertionError as raised:
            assert "bounded comment" in str(raised)
        else:
            raise AssertionError("expected SessionLocal open for bounded comment")


def test_ops_resident_comment_rejects_overlong_without_session():
    with patch.object(operations, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for overlong comment")
        assert operations.resident_confirmation(1, True, "c" * (operations.RESIDENT_COMMENT_MAX + 1)) is False
