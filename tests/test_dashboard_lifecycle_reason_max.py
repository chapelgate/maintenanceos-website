from pathlib import Path

import approval_text
import operations


def test_dashboard_lifecycle_reason_maxima_are_1000():
    assert operations.CANCEL_REASON_MAX == 1000
    assert operations.REOPEN_REASON_MAX == 1000
    assert operations.NO_SHOW_REASON_MAX == 1000
    assert operations.REJECT_REASON_MAX == 1000
    assert operations.TRIAGE_REASON_MAX == 1000
    assert approval_text.APPROVAL_REASON_MAX == 1000


def test_dashboard_wires_lifecycle_and_decision_reason_bounds():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "REOPEN_REASON_MAX" in source
    assert "CANCEL_REASON_MAX" in source
    assert "NO_SHOW_REASON_MAX" in source
    assert "REJECT_REASON_MAX" in source
    assert "TRIAGE_REASON_MAX" in source
    assert "APPROVAL_REASON_MAX" in source
    assert "Lifecycle action reason is too long" in source
    assert "Decision reason is too long" in source
