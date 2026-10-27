import inspect

import pytest
from fastapi import HTTPException

import api


def test_bounded_text_default_max_is_10000():
    assert api.BOUNDED_TEXT_DEFAULT_MAX == 10000
    source = inspect.getsource(api._bounded_text)
    assert "BOUNDED_TEXT_DEFAULT_MAX" in source
    assert "maximum=10000" not in source


def test_bounded_text_default_rejects_overlong():
    with pytest.raises(HTTPException) as exc:
        api._bounded_text("A" * (api.BOUNDED_TEXT_DEFAULT_MAX + 1), "field")
    assert exc.value.status_code == 400


def test_bounded_text_default_accepts_max():
    value = "A" * api.BOUNDED_TEXT_DEFAULT_MAX
    assert api._bounded_text(value, "field") == value
