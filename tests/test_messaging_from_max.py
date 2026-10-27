import inspect

import pytest
from fastapi import HTTPException

import api
import channels


def test_messaging_from_max_matches_participant_max():
    assert api.MESSAGING_FROM_MAX == channels.PARTICIPANT_MAX == 320
    source = inspect.getsource(api.messaging_inbound)
    assert "MESSAGING_FROM_MAX" in source


def test_messaging_from_accepts_bounded_text():
    assert api._bounded_text("+441234567890", "From", required=True, maximum=api.MESSAGING_FROM_MAX) == "+441234567890"
    assert (
        api._bounded_text("a" * api.MESSAGING_FROM_MAX, "From", required=True, maximum=api.MESSAGING_FROM_MAX)
        == "a" * api.MESSAGING_FROM_MAX
    )


def test_messaging_from_rejects_overlong():
    with pytest.raises(HTTPException) as raised:
        api._bounded_text("a" * (api.MESSAGING_FROM_MAX + 1), "From", required=True, maximum=api.MESSAGING_FROM_MAX)
    assert raised.value.status_code == 400
