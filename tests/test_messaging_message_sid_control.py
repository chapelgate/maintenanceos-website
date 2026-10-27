import api
from fastapi import HTTPException
import inspect

SID = "SM1234567890abcdef"
BAD = "SM1234567890\x00abc"


def test_messaging_message_sid_rejects_control_chars():
    try:
        api._reject_control_chars(BAD, "MessageSid")
    except HTTPException as exc:
        assert exc.status_code == 400
        assert "control characters" in exc.detail
    else:
        raise AssertionError("control-char MessageSid not rejected")


def test_messaging_message_sid_wire_uses_reject_control_chars():
    source = inspect.getsource(api.messaging_inbound)
    assert '_reject_control_chars(str(form.get("MessageSid","") or ""),"MessageSid")' in source


def test_messaging_message_sid_accepts_clean_sid():
    assert api._reject_control_chars(SID, "MessageSid") == SID
