import inspect
from unittest.mock import MagicMock

import pytest

import communications


def test_communication_body_max_is_10000():
    assert communications.COMMUNICATION_BODY_MAX == 10000
    source = inspect.getsource(communications.queue_outbound)
    assert "COMMUNICATION_BODY_MAX" in source
    assert "10000" not in source.replace("COMMUNICATION_BODY_MAX", "")


def test_communication_body_accepts_bounded_text():
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
        body="a" * communications.COMMUNICATION_BODY_MAX,
        action_key="reminder-bounded",
    )
    assert delivery is not None
    session.add.assert_called()


def test_communication_body_rejects_overlong():
    session = MagicMock()
    with pytest.raises(ValueError, match="Invalid outbound communication"):
        communications.queue_outbound(
            session,
            client_id=1,
            work_order_id=1,
            channel="EMAIL",
            recipient="synthetic@example.test",
            body="a" * (communications.COMMUNICATION_BODY_MAX + 1),
            action_key="reminder-overlong",
        )
    session.get.assert_not_called()
