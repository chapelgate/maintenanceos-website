import inspect

import api


def _has_live_region(source: str) -> bool:
    return "aria-live" in source and "polite" in source and "status" in source


def test_decision_outcome_markup_has_live_region():
    assert _has_live_region(inspect.getsource(api.contractor_decision_submit))


def test_availability_outcome_markup_has_live_region():
    source = inspect.getsource(api.availability_submit)
    assert _has_live_region(source)
    assert "Availability received" in source


def test_completion_outcome_markup_has_live_region():
    source = inspect.getsource(api.complete_submit)
    assert _has_live_region(source)
    assert "Completion recorded" in source


def test_portal_shell_does_not_make_main_a_live_region():
    source = inspect.getsource(api._portal_page)
    assert "main-content" in source
    assert "aria-live" not in source
