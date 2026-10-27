from pathlib import Path

import safety_controls


def test_dashboard_clearance_exposes_max_chars():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "max_chars=SAFETY_CLEARANCE_REASON_MAX" in source
    assert safety_controls.SAFETY_CLEARANCE_REASON_MAX == 1000
