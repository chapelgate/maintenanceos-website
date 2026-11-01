import pytest
from unittest.mock import MagicMock, patch

import communications as comm


def test_record_delivery_status_rejects_provider_reference_control_chars():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    delivery.work_order_id = 1
    delivery.updated_at = None
    delivery.provider_reference = ""
    delivery.failure_code = ""
    session.get.return_value = delivery
    with patch('communications.json') as mock_json:
        mock_json.dumps = lambda *args, **kwargs: "{}"
        assert comm.record_delivery_status(
            session, 1, "SENT", provider_reference="ref\x00", failure_code=""
        ) is False


def test_record_delivery_status_rejects_failure_code_control_chars():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    delivery.work_order_id = 1
    delivery.updated_at = None
    delivery.provider_reference = ""
    delivery.failure_code = ""
    session.get.return_value = delivery
    with patch('communications.json') as mock_json:
        mock_json.dumps = lambda *args, **kwargs: "{}"
        assert comm.record_delivery_status(
            session, 1, "FAILED", provider_reference="ref", failure_code="code\x01"
        ) is False


def test_record_delivery_status_accepts_clean():
    session = MagicMock()
    delivery = MagicMock()
    delivery.status = "QUEUED"
    delivery.work_order_id = 1
    delivery.updated_at = None
    delivery.provider_reference = ""
    delivery.failure_code = ""
    delivery.attempts = 0
    session.get.return_value = delivery
    with patch('communications.json') as mock_json:
        mock_json.dumps = lambda *args, **kwargs: "{}"
        assert comm.record_delivery_status(
            session, 1, "SENT", provider_reference="msg-123", failure_code=""
        ) is True
