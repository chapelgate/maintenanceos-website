import inspect
from unittest.mock import MagicMock

import pytest

import operations


def test_audit_event_max_is_100():
    assert operations.AUDIT_EVENT_MAX == 100
    source = inspect.getsource(operations.audit)
    assert "AUDIT_EVENT_MAX" in source


def test_audit_event_accepts_bounded_text():
    session = MagicMock()
    event = "E" * operations.AUDIT_EVENT_MAX
    operations.audit(session, 1, "user:1", event, "detail")
    session.add.assert_called_once()
    row = session.add.call_args.args[0]
    assert row.event == event


def test_audit_event_rejects_empty_and_overlong():
    session = MagicMock()
    session.add.side_effect = AssertionError("must not add invalid event")
    with pytest.raises(ValueError, match="audit event invalid"):
        operations.audit(session, 1, "user:1", "")
    with pytest.raises(ValueError, match="audit event invalid"):
        operations.audit(
            session,
            1,
            "user:1",
            "E" * (operations.AUDIT_EVENT_MAX + 1),
        )
