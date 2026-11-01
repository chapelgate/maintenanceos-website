import pytest
from unittest.mock import MagicMock

import communications as comm


def test_queue_outbound_rejects_recipient_control_chars():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(
            session,
            client_id=1,
            work_order_id=1,
            channel="EMAIL",
            recipient="a\x00@b.test",
            body="hello",
            action_key="k1",
        )


def test_queue_outbound_rejects_action_key_control_chars():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(
            session,
            client_id=1,
            work_order_id=1,
            channel="EMAIL",
            recipient="a@b.test",
            body="hello",
            action_key="k\x01ey",
        )


def test_queue_outbound_rejects_body_control_chars():
    session = MagicMock()
    with pytest.raises(ValueError, match="control"):
        comm.queue_outbound(
            session,
            client_id=1,
            work_order_id=1,
            channel="EMAIL",
            recipient="a@b.test",
            body="hello\x00world",
            action_key="k1",
        )
