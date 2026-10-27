import inspect
from unittest.mock import MagicMock

import pytest

import communications


def test_recipient_max_is_320():
    assert communications.RECIPIENT_MAX == 320
    source = inspect.getsource(communications.queue_outbound)
    assert "RECIPIENT_MAX" in source


def _session_for_queue():
    session = MagicMock()
    session.get.return_value = MagicMock(client_id=1)
    session.query.return_value.filter_by.return_value.first.return_value = None
    nested = MagicMock()
    nested.__enter__ = MagicMock(return_value=None)
    nested.__exit__ = MagicMock(return_value=False)
    session.begin_nested.return_value = nested
    return session


def test_recipient_accepts_bounded_text():
    session = _session_for_queue()
    delivery = communications.queue_outbound(
        session,
        client_id=1,
        work_order_id=1,
        channel="EMAIL",
        recipient="a" * communications.RECIPIENT_MAX,
        body="synthetic body",
        action_key="recipient-bounded",
    )
    assert delivery is not None
    session.add.assert_called()


def test_recipient_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Invalid outbound communication"):
        communications.queue_outbound(
            session,
            client_id=1,
            work_order_id=1,
            channel="EMAIL",
            recipient="a" * (communications.RECIPIENT_MAX + 1),
            body="synthetic body",
            action_key="recipient-overlong",
        )
    session.get.assert_not_called()
