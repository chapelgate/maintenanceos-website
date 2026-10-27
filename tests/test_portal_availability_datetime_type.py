import pytest

import api


def test_availability_start_end_are_datetime_local():
    source = inspect_required(api.availability_form)
    assert 'type="datetime-local"' in source
    assert 'id="start"' in source
    assert 'id="end"' in source


def inspect_required(fn):
    import inspect
    return inspect.getsource(fn)
