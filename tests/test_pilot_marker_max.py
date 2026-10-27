import inspect

import pytest
from fastapi import HTTPException

import api


def test_pilot_marker_max_is_64():
    assert api.PILOT_MARKER_MAX == 64
    source = inspect.getsource(api.pilot_synthetic_email_proof)
    assert "PILOT_MARKER_MAX" in source
    assert "maximum=64" not in source


def test_pilot_marker_bound_rejects_overlong():
    with pytest.raises(HTTPException) as exc:
        api._bounded_text("A" * (api.PILOT_MARKER_MAX + 1), "marker", required=True, maximum=api.PILOT_MARKER_MAX)
    assert exc.value.status_code == 400


def test_pilot_marker_bound_accepts_max():
    value = "A" * api.PILOT_MARKER_MAX
    assert api._bounded_text(value, "marker", required=True, maximum=api.PILOT_MARKER_MAX) == value
