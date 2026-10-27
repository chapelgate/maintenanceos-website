from unittest.mock import MagicMock, patch

import pytest

import channels


def test_accumulate_uses_channel_description_max():
    assert channels.CHANNEL_DESCRIPTION_MAX == 8000


def test_accumulate_rejects_over_cap_before_commit():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 7
    wo.description = "a" * channels.CHANNEL_DESCRIPTION_MAX
    existing = MagicMock()
    existing.work_order_id = 7
    query = MagicMock()
    query.filter_by.return_value.first.side_effect = [existing]
    session.query.return_value = query
    session.get.return_value = wo

    class _CM:
        def __enter__(self_inner):
            return session

        def __exit__(self_inner, *args):
            return False

    with patch.object(channels, "SessionLocal", return_value=_CM()):
        with patch.object(channels, "require_client_resource"):
            with pytest.raises(ValueError, match="description is invalid"):
                channels.create_from_channel(
                    1,
                    1,
                    1,
                    "SMS",
                    "follow-up note",
                    incident_key="daily:fixed",
                )
    session.commit.assert_not_called()


def test_accumulate_allows_combined_within_cap():
    session = MagicMock()
    wo = MagicMock()
    wo.id = 9
    wo.description = "leak"
    existing = MagicMock()
    existing.work_order_id = 9
    query = MagicMock()
    query.filter_by.return_value.first.side_effect = [existing]
    session.query.return_value = query
    session.get.return_value = wo

    class _CM:
        def __enter__(self_inner):
            return session

        def __exit__(self_inner, *args):
            return False

    with patch.object(channels, "SessionLocal", return_value=_CM()):
        with patch.object(channels, "require_client_resource"):
            with patch.object(channels, "_finish_intake"):
                wid = channels.create_from_channel(
                    1,
                    1,
                    1,
                    "SMS",
                    "kitchen sink",
                    incident_key="daily:fixed",
                )
    assert wid == 9
    assert wo.description == "leak\nkitchen sink"
    session.commit.assert_called_once()
