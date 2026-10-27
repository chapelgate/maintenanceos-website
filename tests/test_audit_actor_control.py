import inspect
from unittest.mock import MagicMock

import pytest

import operations


def test_audit_source_rejects_control_chars():
    source = inspect.getsource(operations.audit)
    assert "reason_has_control_chars" in source
    assert "audit control characters" in source


def test_audit_rejects_control_chars_in_actor():
    session = MagicMock()
    with pytest.raises(ValueError, match="audit control characters"):
        operations.audit(session, 1, "User" + chr(0) + "1", "TESTED", "{}")
    session.add.assert_not_called()


def test_audit_rejects_control_chars_in_event():
    session = MagicMock()
    with pytest.raises(ValueError, match="audit control characters"):
        operations.audit(session, 1, "User:1", "EV" + chr(0) + "ENT", "{}")
    session.add.assert_not_called()
