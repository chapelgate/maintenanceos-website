import inspect

import pytest
from fastapi import HTTPException

import api


def test_quotes_and_invoices_reject_control_chars():
    for fn in (api.quotes, api.invoices):
        source = inspect.getsource(fn)
        assert "_reject_control_chars" in source
        assert "QUOTE_DESCRIPTION_MAX" in source


def test_reject_control_chars_on_description():
    with pytest.raises(HTTPException) as exc:
        api._reject_control_chars("ok\x00bad", "description")
    assert exc.value.status_code == 400
