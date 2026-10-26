import inspect
from unittest.mock import MagicMock

import communications


def test_provider_reference_max_is_200():
    assert communications.PROVIDER_REFERENCE_MAX == 200
    source = inspect.getsource(communications.record_delivery_status)
    assert "PROVIDER_REFERENCE_MAX" in source


def test_provider_reference_accepts_bounded_text():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    delivery.provider_reference = ""
    delivery.communication_id = 1
    delivery.work_order_id = 1
    delivery.id = 9
    session.get.side_effect = [delivery, MagicMock()]
    assert communications.record_delivery_status(
        session,
        9,
        "SENT",
        provider_reference="p" * communications.PROVIDER_REFERENCE_MAX,
    )
    assert delivery.provider_reference == "p" * communications.PROVIDER_REFERENCE_MAX


def test_provider_reference_rejects_overlong():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    session.get.return_value = delivery
    assert not communications.record_delivery_status(
        session,
        9,
        "SENT",
        provider_reference="p" * (communications.PROVIDER_REFERENCE_MAX + 1),
    )
    assert delivery.status == "QUEUED"
