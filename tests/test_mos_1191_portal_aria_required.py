import inspect

import api


def test_availability_required_fields_expose_aria_required():
    source = inspect.getsource(api.availability_form)
    assert 'id="start"' in source
    assert 'id="end"' in source
    assert source.count('aria-required="true"') >= 2
    assert 'required aria-required="true"' in source


def test_completion_note_exposes_aria_required():
    source = inspect.getsource(api.complete_form)
    assert 'id="note"' in source
    assert 'aria-required="true"' in source
    assert 'required aria-required="true"' in source


def test_decision_form_unchanged_no_false_aria_required():
    source = inspect.getsource(api.contractor_decision)
    assert 'aria-required' not in source
