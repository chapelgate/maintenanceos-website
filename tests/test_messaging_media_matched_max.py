import inspect

import pytest
from fastapi import HTTPException

import api
import channels


def test_messaging_media_url_max_matches_channel_max():
    assert api.MESSAGING_MEDIA_URL_MAX == channels.MEDIA_URL_MAX == 2000
    source = inspect.getsource(api.messaging_inbound)
    assert "MESSAGING_MEDIA_URL_MAX" in source


def test_messaging_media_url_accepts_bounded_text():
    assert api._bounded_text("https://example.com/a", "MediaUrl0", maximum=api.MESSAGING_MEDIA_URL_MAX) == "https://example.com/a"
    assert (
        api._bounded_text("a" * api.MESSAGING_MEDIA_URL_MAX, "MediaUrl0", maximum=api.MESSAGING_MEDIA_URL_MAX)
        == "a" * api.MESSAGING_MEDIA_URL_MAX
    )


def test_messaging_media_url_rejects_overlong():
    with pytest.raises(HTTPException) as raised:
        api._bounded_text("a" * (api.MESSAGING_MEDIA_URL_MAX + 1), "MediaUrl0", maximum=api.MESSAGING_MEDIA_URL_MAX)
    assert raised.value.status_code == 400
