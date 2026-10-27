import inspect

import api
import postcode_normalise


def test_api_postcode_uses_shared_max():
    assert postcode_normalise.POSTCODE_MAX == 20
    source = inspect.getsource(api.identity_postcode)
    assert "POSTCODE_MAX" in source
    assert "maximum=20" not in source


def test_api_postcode_bound_rejects_overlong():
    import pytest
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as exc:
        api._bounded_text("A" * (postcode_normalise.POSTCODE_MAX + 1), "postcode", required=True, maximum=postcode_normalise.POSTCODE_MAX)
    assert exc.value.status_code == 400


def test_api_postcode_bound_accepts_max():
    value = "A" * postcode_normalise.POSTCODE_MAX
    assert api._bounded_text(value, "postcode", required=True, maximum=postcode_normalise.POSTCODE_MAX) == value
