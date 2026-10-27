import pytest
from fastapi import HTTPException

import api


def test_messaging_to_max_matches_from_max():
    assert api.MESSAGING_TO_MAX == api.MESSAGING_FROM_MAX


def test_api_wires_reject_on_to():
    source = open("api.py").read()
    assert "async def messaging_inbound" in source
    messaging = source.split("async def messaging_inbound", 1)[1].split("async def ", 1)[0]
    assert 'form.get("To") or form.get("Called")' in messaging
    assert "MESSAGING_TO_MAX" in messaging
    assert "_reject_control_chars" in messaging
    voice = source.split("async def voice_inbound", 1)[1].split("async def ", 1)[0]
    assert "MESSAGING_TO_MAX" not in voice


def test_reject_control_chars_on_to():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("+44\x001", "To")
    assert exc.value.status_code == 400
