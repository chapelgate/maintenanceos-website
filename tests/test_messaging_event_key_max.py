import hashlib
import inspect

import pytest
from fastapi import HTTPException

import api
import channels


def test_messaging_event_key_max_matches_channel_max():
    assert api.MESSAGING_EVENT_KEY_MAX == channels.EVENT_KEY_MAX == 200
    source = inspect.getsource(api.messaging_inbound)
    assert "messaging_event_key" in source


def test_messaging_event_key_accepts_bounded_sid():
    assert api.messaging_event_key("SM123", "SMS", "+441", "tap") == "SM123"


def test_messaging_event_key_rejects_overlong_sid():
    with pytest.raises(HTTPException) as raised:
        api.messaging_event_key("S" * (api.MESSAGING_EVENT_KEY_MAX + 1), "SMS", "+441", "tap")
    assert raised.value.status_code == 400


def test_messaging_event_key_hashes_when_sid_blank():
    body = "a" * 500
    key = api.messaging_event_key("", "SMS", "+441234", body)
    digest = hashlib.sha256(f"SMS:+441234:{body}".encode()).hexdigest()[:40]
    assert key == f"msg:{digest}"
    assert len(key) <= api.MESSAGING_EVENT_KEY_MAX
