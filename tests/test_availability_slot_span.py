import inspect
from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException

import api


def test_availability_slot_max_days_is_14():
    assert api.AVAILABILITY_SLOT_MAX_DAYS == 14
    source = inspect.getsource(api.availability_submit)
    assert "validate_availability_slot" in source


def test_availability_slot_accepts_bounded_span():
    start = datetime(2026, 10, 25, 9, 0)
    api.validate_availability_slot(start, start + timedelta(hours=1))
    api.validate_availability_slot(start, start + timedelta(days=api.AVAILABILITY_SLOT_MAX_DAYS))


def test_availability_slot_rejects_inverted_and_overlong():
    start = datetime(2026, 10, 25, 9, 0)
    for end in (start, start - timedelta(minutes=1), start + timedelta(days=api.AVAILABILITY_SLOT_MAX_DAYS, seconds=1)):
        with pytest.raises(HTTPException) as raised:
            api.validate_availability_slot(start, end)
        assert raised.value.status_code == 400
