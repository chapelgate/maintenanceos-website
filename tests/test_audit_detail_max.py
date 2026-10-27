from unittest.mock import MagicMock

import pytest

import operations


def test_audit_detail_max_is_8000():
    assert operations.AUDIT_DETAIL_MAX == 8000


def test_audit_accepts_bounded_detail():
    session = MagicMock()
    detail = "d" * operations.AUDIT_DETAIL_MAX
    operations.audit(session, 1, "user:1", "TEST_EVENT", detail)
    session.add.assert_called_once()
    event = session.add.call_args.args[0]
    assert event.detail == detail


def test_audit_rejects_overlong_detail_before_add():
    session = MagicMock()
    with pytest.raises(ValueError, match="audit detail invalid"):
        operations.audit(
            session,
            1,
            "user:1",
            "TEST_EVENT",
            "d" * (operations.AUDIT_DETAIL_MAX + 1),
        )
    session.add.assert_not_called()
