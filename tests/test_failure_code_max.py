import inspect
from unittest.mock import MagicMock

import communications


def test_failure_code_max_is_100():
    assert communications.FAILURE_CODE_MAX == 100
    source = inspect.getsource(communications.record_delivery_status)
    assert "FAILURE_CODE_MAX" in source


def test_failure_code_accepts_bounded_text():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    delivery.provider_reference = ""
    delivery.communication_id = 1
    delivery.work_order_id = 1
    delivery.id = 9
    session.get.side_effect = [delivery, MagicMock()]
    session.query.return_value.filter_by.return_value.first.return_value = MagicMock()
    assert communications.record_delivery_status(
        session,
        9,
        "FAILED",
        failure_code="f" * communications.FAILURE_CODE_MAX,
    )
    assert delivery.failure_code == "f" * communications.FAILURE_CODE_MAX


def test_failure_code_rejects_overlong():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    session.get.return_value = delivery
    assert not communications.record_delivery_status(
        session,
        9,
        "FAILED",
        failure_code="f" * (communications.FAILURE_CODE_MAX + 1),
    )
    assert delivery.status == "QUEUED"
