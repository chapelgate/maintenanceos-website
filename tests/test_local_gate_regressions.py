import pytest
from fastapi import HTTPException
import api
from webhook_security import public_provider_ingress_ready, dedicated_test_number_ready


def test_public_ingress_disabled_by_default(monkeypatch):
    monkeypatch.delenv('ENABLE_PUBLIC_PROVIDER_INGRESS', raising=False)
    assert not public_provider_ingress_ready()
    with pytest.raises(HTTPException) as exc:
        api.require_public_provider_ingress()
    assert exc.value.status_code == 503


def test_dedicated_number_requires_confirmation_and_distinct_transfer(monkeypatch):
    monkeypatch.setenv('TWILIO_PHONE_NUMBER', '+441234567890')
    monkeypatch.setenv('TWILIO_HUMAN_TRANSFER_NUMBER', '+441234567890')
    monkeypatch.setenv('TWILIO_TEST_NUMBER_CONFIRMED', 'true')
    assert not dedicated_test_number_ready()
    monkeypatch.setenv('TWILIO_HUMAN_TRANSFER_NUMBER', '+441234567891')
    assert dedicated_test_number_ready()
    monkeypatch.setenv('TWILIO_TEST_NUMBER_CONFIRMED', 'false')
    assert not dedicated_test_number_ready()
