from pathlib import Path

import safety_controls


def test_safety_clearance_reason_max_is_1000():
    assert safety_controls.SAFETY_CLEARANCE_REASON_MAX == 1000


def test_dashboard_wires_safety_clearance_bound():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "SAFETY_CLEARANCE_REASON_MAX" in source
    assert "Safety clearance evidence is too long" in source
