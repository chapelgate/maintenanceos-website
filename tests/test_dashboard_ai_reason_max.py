from pathlib import Path

import api
import idempotency


def test_dashboard_ai_reason_max_matches_runtime():
    assert idempotency.AI_SIDE_EFFECT_REASON_MAX == api.AI_SIDE_EFFECT_REASON_MAX == 500
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "AI_SIDE_EFFECT_REASON_MAX" in source
    assert "Control change reason is too long" in source
    assert "len(reason)>AI_SIDE_EFFECT_REASON_MAX" in source or "len(reason) > AI_SIDE_EFFECT_REASON_MAX" in source


def test_set_ai_side_effects_still_rejects_overlong_reason():
    class _Session:
        def get(self, *_args, **_kwargs):
            return None

        def add(self, *_args, **_kwargs):
            return None

    try:
        idempotency.set_ai_side_effects(
            _Session(),
            True,
            actor="User:1",
            reason="a" * (idempotency.AI_SIDE_EFFECT_REASON_MAX + 1),
        )
        raised = False
    except ValueError as exc:
        raised = True
        assert "too long" in str(exc)
    assert raised
