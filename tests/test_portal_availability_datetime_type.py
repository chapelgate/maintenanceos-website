import inspect

import api


def test_availability_start_end_are_datetime_local():
    source = inspect.getsource(api.availability_form)
    assert 'type="datetime-local"' in source
    assert 'id="start"' in source
    assert 'id="end"' in source


def test_availability_submit_parses_datetime_local():
    source = inspect.getsource(api.availability_submit)
    assert '%Y-%m-%dT%H:%M' in source
