import inspect

import api


def test_incident_link_key_max_is_200():
    assert api.INCIDENT_LINK_KEY_MAX == 200


def test_create_work_order_bounds_incident_key():
    source = inspect.getsource(api.create_work_order)
    assert "INCIDENT_LINK_KEY_MAX" in source
    assert '_bounded_text(raw_incident,"incident_key"' in source or "_bounded_text(raw_incident, \"incident_key\"" in source
    assert 'd.get("incident_key")' in source
    assert "incident_key=incident_key" in source


def test_bounded_text_rejects_overlong_incident_key():
    from fastapi import HTTPException
    import pytest

    with pytest.raises(HTTPException) as exc:
        api._bounded_text("i" * (api.INCIDENT_LINK_KEY_MAX + 1), "incident_key", maximum=api.INCIDENT_LINK_KEY_MAX)
    assert exc.value.status_code == 400


def test_bounded_text_accepts_incident_key_at_max():
    value = "i" * api.INCIDENT_LINK_KEY_MAX
    assert api._bounded_text(value, "incident_key", maximum=api.INCIDENT_LINK_KEY_MAX) == value
