import inspect

import pytest
from fastapi import HTTPException

import api


def test_messaging_body_rejects_control_chars():
    source = inspect.getsource(api.messaging_inbound)
    assert "_reject_control_chars" in source
    assert "MESSAGING_BODY_MAX" in source


def test_reject_control_chars_on_body():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x00bad", "body")
    assert exc.value.status_code == 400
