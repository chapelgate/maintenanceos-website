import inspect

import pytest
from fastapi import HTTPException

import api


def test_ai_side_effects_reason_rejects_control_chars():
    source = inspect.getsource(api.control_ai_side_effects)
    assert "_reject_control_chars" in source
    assert "AI_SIDE_EFFECT_REASON_MAX" in source


def test_reject_control_chars_on_ai_reason():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x00bad", "reason")
    assert exc.value.status_code == 400
