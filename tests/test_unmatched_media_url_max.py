import inspect

import pytest
from fastapi import HTTPException

import api


def test_unmatched_inbound_media_url_max_is_2000():
    assert api.UNMATCHED_INBOUND_MEDIA_URL_MAX == 2000
    source = inspect.getsource(api.messaging_inbound)
    assert "UNMATCHED_INBOUND_MEDIA_URL_MAX" in source


def test_unmatched_inbound_media_url_accepts_bounded_text():
    assert api._bounded_text("", "MediaUrl0", maximum=api.UNMATCHED_INBOUND_MEDIA_URL_MAX) == ""
    assert (
        api._bounded_text("https://example.com/a", "MediaUrl0", maximum=api.UNMATCHED_INBOUND_MEDIA_URL_MAX)
        == "https://example.com/a"
    )
    assert (
        api._bounded_text("a" * api.UNMATCHED_INBOUND_MEDIA_URL_MAX, "MediaUrl0", maximum=api.UNMATCHED_INBOUND_MEDIA_URL_MAX)
        == "a" * api.UNMATCHED_INBOUND_MEDIA_URL_MAX
    )


def test_unmatched_inbound_media_url_rejects_overlong():
    with pytest.raises(HTTPException) as raised:
        api._bounded_text(
            "a" * (api.UNMATCHED_INBOUND_MEDIA_URL_MAX + 1),
            "MediaUrl0",
            maximum=api.UNMATCHED_INBOUND_MEDIA_URL_MAX,
        )
    assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "MediaUrl0", maximum=api.UNMATCHED_INBOUND_MEDIA_URL_MAX)
    assert typed.value.status_code == 400
