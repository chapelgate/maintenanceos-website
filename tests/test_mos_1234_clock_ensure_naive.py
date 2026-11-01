from datetime import UTC, datetime, timedelta, timezone

import pytest

from clock import ensure_naive_utc, utcnow


def test_ensure_naive_utc_passes_naive():
    value = datetime(2026, 1, 1, 12, 0, 0)
    assert ensure_naive_utc(value) == value


def test_ensure_naive_utc_strips_utc():
    value = datetime(2026, 1, 1, 12, 0, 0, tzinfo=UTC)
    assert ensure_naive_utc(value) == datetime(2026, 1, 1, 12, 0, 0)


def test_ensure_naive_utc_rejects_non_utc():
    tz = timezone(timedelta(hours=1))
    with pytest.raises(ValueError, match="non-UTC"):
        ensure_naive_utc(datetime(2026, 1, 1, 12, 0, 0, tzinfo=tz))


def test_utcnow_is_naive():
    assert utcnow().tzinfo is None
