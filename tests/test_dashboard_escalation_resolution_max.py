from pathlib import Path

import operations


def test_escalation_resolution_max_is_1000():
    assert operations.ESCALATION_RESOLUTION_MAX == 1000


def test_dashboard_wires_escalation_resolution_bound():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "ESCALATION_RESOLUTION_MAX" in source
    assert "Resolution reason is too long" in source
