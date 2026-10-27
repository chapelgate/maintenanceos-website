import inspect
from unittest.mock import patch

import pytest

import api
import channels


def test_channel_description_max_matches_work_order_cap():
    assert channels.CHANNEL_DESCRIPTION_MAX == api.WORK_ORDER_DESCRIPTION_MAX == 8000
    source = inspect.getsource(channels.create_from_channel)
    assert "CHANNEL_DESCRIPTION_MAX" in source
    assert "description is invalid" in source


def test_channel_description_accepts_bounded_text():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("bounded description must open session")
        with pytest.raises(AssertionError, match="bounded description"):
            channels.create_from_channel(
                1,
                1,
                1,
                "SMS",
                "a" * channels.CHANNEL_DESCRIPTION_MAX,
            )


def test_channel_description_rejects_blank_and_overlong_without_session():
    with patch.object(channels, "SessionLocal") as session_local:
        session_local.side_effect = AssertionError("session must not open for invalid description")
        for bad in ("", "   ", "a" * (channels.CHANNEL_DESCRIPTION_MAX + 1)):
            with pytest.raises(ValueError, match="description is invalid"):
                channels.create_from_channel(1, 1, 1, "SMS", bad)
