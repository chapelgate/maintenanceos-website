import inspect

import pytest
from fastapi import HTTPException

import api
import safety_controls


def test_safety_clearance_reason_max_is_1000():
    assert safety_controls.SAFETY_CLEARANCE_REASON_MAX == 1000
    assert api.SAFETY_CLEARANCE_REASON_MAX == 1000
    source = inspect.getsource(api.safety_clearance)
    assert "SAFETY_CLEARANCE_REASON_MAX" in source
    clear_source = inspect.getsource(safety_controls.clear_critical_safety)
    assert "SAFETY_CLEARANCE_REASON_MAX" in clear_source


def test_safety_clearance_reason_accepts_bounded_text():
    assert (
        api._bounded_text(
            "Gas engineer confirmed isolated supply",
            "reason",
            required=True,
            maximum=api.SAFETY_CLEARANCE_REASON_MAX,
        )
        == "Gas engineer confirmed isolated supply"
    )
    assert (
        api._bounded_text(
            "a" * api.SAFETY_CLEARANCE_REASON_MAX,
            "reason",
            required=True,
            maximum=api.SAFETY_CLEARANCE_REASON_MAX,
        )
        == "a" * api.SAFETY_CLEARANCE_REASON_MAX
    )


def test_safety_clearance_reason_rejects_overlong():
    for bad in ("", "   ", "a" * (api.SAFETY_CLEARANCE_REASON_MAX + 1)):
        with pytest.raises(HTTPException) as raised:
            api._bounded_text(
                bad,
                "reason",
                required=True,
                maximum=api.SAFETY_CLEARANCE_REASON_MAX,
            )
        assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "reason", maximum=api.SAFETY_CLEARANCE_REASON_MAX)
    assert typed.value.status_code == 400
