import inspect
from unittest.mock import MagicMock

import pytest

import idempotency


def test_receipt_action_key_max_is_200():
    assert idempotency.ACTION_KEY_MAX == 200
    source = inspect.getsource(idempotency.claim_action)
    assert "ACTION_KEY_MAX" in source


def test_receipt_action_key_accepts_bounded_text():
    session = MagicMock()
    session.query.return_value.filter_by.return_value.first.return_value = None
    nested = MagicMock()
    nested.__enter__ = MagicMock(return_value=None)
    nested.__exit__ = MagicMock(return_value=False)
    session.begin_nested.return_value = nested
    receipt, created = idempotency.claim_action(
        session,
        scope="synthetic-scope",
        action_key="a" * idempotency.ACTION_KEY_MAX,
        client_id=1,
    )
    assert created is True
    assert receipt is not None
    session.add.assert_called()


def test_receipt_action_key_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Invalid action receipt key"):
        idempotency.claim_action(
            session,
            scope="synthetic-scope",
            action_key="a" * (idempotency.ACTION_KEY_MAX + 1),
            client_id=1,
        )
    session.query.assert_not_called()
