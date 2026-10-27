from pathlib import Path

import operations


def test_dashboard_resolution_exposes_max_chars():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "max_chars=ESCALATION_RESOLUTION_MAX" in source
    assert operations.ESCALATION_RESOLUTION_MAX == 1000
