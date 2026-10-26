import inspect
from unittest.mock import MagicMock

import pytest

import operations


def test_audit_actor_max_is_100():
    assert operations.AUDIT_ACTOR_MAX == 100
    source = inspect.getsource(operations.audit)
    assert "AUDIT_ACTOR_MAX" in source


def test_audit_actor_accepts_bounded_text():
    session = MagicMock()
    actor = "a" * operations.AUDIT_ACTOR_MAX
    operations.audit(session, 1, actor, "TEST_EVENT", "detail")
    session.add.assert_called_once()
    event = session.add.call_args.args[0]
    assert event.actor == actor


def test_audit_actor_rejects_empty_and_overlong():
    session = MagicMock()
    session.add.side_effect = AssertionError("must not add invalid actor")
    with pytest.raises(ValueError, match="audit actor invalid"):
        operations.audit(session, 1, "", "TEST_EVENT")
    with pytest.raises(ValueError, match="audit actor invalid"):
        operations.audit(
            session,
            1,
            "a" * (operations.AUDIT_ACTOR_MAX + 1),
            "TEST_EVENT",
        )
