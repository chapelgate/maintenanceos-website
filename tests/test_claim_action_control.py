import inspect
from unittest.mock import MagicMock

import pytest

import idempotency


def test_claim_action_source_rejects_control_chars():
    source = inspect.getsource(idempotency.claim_action)
    assert "_has_control_chars" in source
    assert "action_key_control_chars" in source


def test_claim_action_rejects_control_chars_in_action_key():
    session = MagicMock()
    with pytest.raises(ValueError, match="action_key_control_chars"):
        idempotency.claim_action(
            session,
            scope="synthetic-scope",
            action_key="ok\x00key",
            client_id=1,
        )
    session.query.assert_not_called()


def test_claim_action_rejects_control_chars_after_length_gate():
    session = MagicMock()
    with pytest.raises(ValueError, match="Invalid action receipt key"):
        idempotency.claim_action(
            session,
            scope="synthetic-scope",
            action_key="a" * (idempotency.ACTION_KEY_MAX + 1),
            client_id=1,
        )
    session.query.assert_not_called()
