from pathlib import Path

import idempotency


def test_dashboard_control_exposes_max_chars():
    assert idempotency.AI_SIDE_EFFECT_REASON_MAX == 500
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "max_chars=AI_SIDE_EFFECT_REASON_MAX" in source
    assert "Control change reason" in source
