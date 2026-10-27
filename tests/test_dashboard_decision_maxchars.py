from pathlib import Path

import approval_text
import operations


def test_dashboard_decision_exposes_max_chars():
    assert approval_text.APPROVAL_REASON_MAX == operations.REJECT_REASON_MAX == operations.TRIAGE_REASON_MAX == 1000
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert 'max_chars=APPROVAL_REASON_MAX' in source
    assert 'Decision reason' in source
