import inspect

import pytest
from fastapi import HTTPException

import api


def test_ai_side_effect_reason_max_is_500():
    assert api.AI_SIDE_EFFECT_REASON_MAX == 500
    source = inspect.getsource(api.control_ai_side_effects)
    assert "AI_SIDE_EFFECT_REASON_MAX" in source


def test_ai_side_effect_reason_accepts_bounded_text():
    assert (
        api._bounded_text(
            "disable remote side effects for synthetic pilot",
            "reason",
            required=True,
            maximum=api.AI_SIDE_EFFECT_REASON_MAX,
        )
        == "disable remote side effects for synthetic pilot"
    )
    assert (
        api._bounded_text(
            "a" * api.AI_SIDE_EFFECT_REASON_MAX,
            "reason",
            required=True,
            maximum=api.AI_SIDE_EFFECT_REASON_MAX,
        )
        == "a" * api.AI_SIDE_EFFECT_REASON_MAX
    )


def test_ai_side_effect_reason_rejects_empty_and_overlong():
    for bad in ("", "   ", "a" * (api.AI_SIDE_EFFECT_REASON_MAX + 1)):
        with pytest.raises(HTTPException) as raised:
            api._bounded_text(
                bad,
                "reason",
                required=True,
                maximum=api.AI_SIDE_EFFECT_REASON_MAX,
            )
        assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "reason", maximum=api.AI_SIDE_EFFECT_REASON_MAX)
    assert typed.value.status_code == 400
