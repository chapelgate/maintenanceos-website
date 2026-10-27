import inspect
from pathlib import Path

import api
import work_order_text


def test_dashboard_description_max_matches_api():
    assert work_order_text.WORK_ORDER_DESCRIPTION_MAX == api.WORK_ORDER_DESCRIPTION_MAX == 8000
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "problem_description_error" in source
    assert "problem_error" in source


def test_problem_description_accepts_bounded_plain_text():
    assert work_order_text.problem_description_error("leaking tap") is None
    assert work_order_text.problem_description_error("line1\nline2") is None
    assert (
        work_order_text.problem_description_error("a" * work_order_text.WORK_ORDER_DESCRIPTION_MAX)
        is None
    )


def test_problem_description_rejects_blank_overlong_and_controls():
    assert work_order_text.problem_description_error("") == "Problem description is required"
    assert work_order_text.problem_description_error("   ") == "Problem description is required"
    assert (
        work_order_text.problem_description_error(
            "a" * (work_order_text.WORK_ORDER_DESCRIPTION_MAX + 1)
        )
        == "Problem description is too long"
    )
    for bad in ("\x00leak", "leak\x01", "\x1ftext"):
        assert (
            work_order_text.problem_description_error(bad)
            == "Problem description contains control characters"
        )
