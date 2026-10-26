import inspect

import pytest
from fastapi import HTTPException

import api


def test_quote_description_max_is_4000():
    assert api.QUOTE_DESCRIPTION_MAX == 4000
    assert "QUOTE_DESCRIPTION_MAX" in inspect.getsource(api.quotes)
    assert "QUOTE_DESCRIPTION_MAX" in inspect.getsource(api.invoices)


def test_quote_description_accepts_bounded_text():
    assert api._bounded_text("new boiler", "description", maximum=api.QUOTE_DESCRIPTION_MAX) == "new boiler"
    assert (
        api._bounded_text("a" * api.QUOTE_DESCRIPTION_MAX, "description", maximum=api.QUOTE_DESCRIPTION_MAX)
        == "a" * api.QUOTE_DESCRIPTION_MAX
    )


def test_quote_description_rejects_overlong():
    with pytest.raises(HTTPException) as raised:
        api._bounded_text(
            "a" * (api.QUOTE_DESCRIPTION_MAX + 1),
            "description",
            maximum=api.QUOTE_DESCRIPTION_MAX,
        )
    assert raised.value.status_code == 400
    with pytest.raises(HTTPException) as typed:
        api._bounded_text(123, "description", maximum=api.QUOTE_DESCRIPTION_MAX)
    assert typed.value.status_code == 400
