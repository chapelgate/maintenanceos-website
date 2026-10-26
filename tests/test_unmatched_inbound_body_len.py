import inspect

import pytest
from fastapi import HTTPException

import api


def test_unmatched_inbound_body_max_is_4000():
    assert api.UNMATCHED_INBOUND_BODY_MAX == 4000
    source = inspect.getsource(api.messaging_inbound)
    assert "UNMATCHED_INBOUND_BODY_MAX" in source


def test_unmatched_inbound_body_accepts_bounded_text():
    assert api._bounded_text("unknown caller", "Body", maximum=api.UNMATCHED_INBOUND_BODY_MAX) == "unknown caller"
    assert (
        api._bounded_text("a" * api.UNMATCHED_INBOUND_BODY_MAX, "Body", maximum=api.UNMATCHED_INBOUND_BODY_MAX)
        == "a" * api.UNMATCHED_INBOUND_BODY_MAX
    )


def test_unmatched_inbound_body_rejects_overlong():
    with pytest.raises(HTTPException) as raised:
        api._bounded_text("a" * (api.UNMATCHED_INBOUND_BODY_MAX + 1), "Body", maximum=api.UNMATCHED_INBOUND_BODY_MAX)
    assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "Body", maximum=api.UNMATCHED_INBOUND_BODY_MAX)
    assert typed.value.status_code == 400
