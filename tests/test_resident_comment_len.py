import inspect

import pytest
from fastapi import HTTPException

import api


def test_resident_comment_max_is_4000():
    assert api.RESIDENT_COMMENT_MAX == 4000
    source = inspect.getsource(api.confirm)
    assert "RESIDENT_COMMENT_MAX" in source


def test_resident_comment_accepts_bounded_text():
    assert api._bounded_text("fixed leak", "comment", maximum=api.RESIDENT_COMMENT_MAX) == "fixed leak"
    assert api._bounded_text("a" * api.RESIDENT_COMMENT_MAX, "comment", maximum=api.RESIDENT_COMMENT_MAX) == "a" * api.RESIDENT_COMMENT_MAX


def test_resident_comment_rejects_overlong():
    with pytest.raises(HTTPException) as raised:
        api._bounded_text("a" * (api.RESIDENT_COMMENT_MAX + 1), "comment", maximum=api.RESIDENT_COMMENT_MAX)
    assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "comment", maximum=api.RESIDENT_COMMENT_MAX)
    assert typed.value.status_code == 400
