from pathlib import Path

import work_order_text


def test_dashboard_problem_exposes_max_chars():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "WORK_ORDER_DESCRIPTION_MAX" in source
    assert "max_chars=WORK_ORDER_DESCRIPTION_MAX" in source
    assert work_order_text.WORK_ORDER_DESCRIPTION_MAX == 8000
