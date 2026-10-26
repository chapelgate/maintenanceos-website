import inspect
from unittest.mock import MagicMock

import pytest

import communications


def test_delivery_action_key_max_is_200():
    assert communications.ACTION_KEY_MAX == 200
    source = inspect.getsource(communications.queue_outbound)
    assert "ACTION_KEY_MAX" in source


def test_delivery_action_key_accepts_bounded_text():
    session = MagicMock()
    session.get.return_value = MagicMock(client_id=1)
    session.query.return_value.filter_by.return_value.first.return_value = None
    nested = MagicMock()
    nested.__enter__ = MagicMock(return_value=None)
    nested.__exit__ = MagicMock(return_value=False)
    session.begin_nested.return_value = nested
    delivery = communications.queue_outbound(
        session,
        client_id=1,
        work_order_id=1,
        channel="EMAIL",
        recipient="synthetic@example.test",
        body="Reminder",
        action_key="a" * communications.ACTION_KEY_MAX,
    )
    assert delivery is not None
    session.add.assert_called()


def test_delivery_action_key_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Invalid outbound communication"):
        communications.queue_outbound(
            session,
            client_id=1,
            work_order_id=1,
            channel="EMAIL",
            recipient="synthetic@example.test",
            body="Reminder",
            action_key="a" * (communications.ACTION_KEY_MAX + 1),
        )
    session.get.assert_not_called()
