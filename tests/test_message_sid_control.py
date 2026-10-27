import inspect

import pytest
from fastapi import HTTPException

import api


def test_messaging_event_key_source_rejects_control_chars():
    source = inspect.getsource(api.messaging_event_key)
    assert "_reject_control_chars" in source
    assert "MessageSid" in source


def test_messaging_event_key_rejects_control_chars():
    with pytest.raises(HTTPException) as exc:
        api.messaging_event_key("SM\x00abc", "SMS", "+441", "tap")
    assert exc.value.status_code == 400
    assert "control" in str(exc.value.detail).lower()


def test_messaging_event_key_accepts_clean_sid():
    assert api.messaging_event_key("SM123", "SMS", "+441", "tap") == "SM123"
