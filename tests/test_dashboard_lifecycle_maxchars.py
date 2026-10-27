from pathlib import Path

import operations


def test_dashboard_lifecycle_exposes_max_chars():
    assert operations.REOPEN_REASON_MAX == operations.CANCEL_REASON_MAX == operations.NO_SHOW_REASON_MAX == 1000
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert 'max_chars=REOPEN_REASON_MAX' in source
