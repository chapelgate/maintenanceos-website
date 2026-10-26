import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

import api
import operations
import readiness


def test_contractor_portal_defaults_off(monkeypatch):
    monkeypatch.delenv("ENABLE_CONTRACTOR_PORTAL", raising=False)
    assert readiness.CHECKS["contractor_portal_disabled"]() is True
    with pytest.raises(HTTPException) as exc:
        api.require_contractor_portal()
    assert exc.value.status_code == 503
    assert "disabled" in str(exc.value.detail).lower()

    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "false")
    assert readiness.CHECKS["contractor_portal_disabled"]() is True
    with pytest.raises(HTTPException):
        api.require_contractor_portal()

    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "yes")
    assert readiness.CHECKS["contractor_portal_disabled"]() is True
    with pytest.raises(HTTPException):
        api.require_contractor_portal()

    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "1")
    assert readiness.CHECKS["contractor_portal_disabled"]() is True
    with pytest.raises(HTTPException):
        api.require_contractor_portal()

    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", " TRUE \n")
    assert readiness.CHECKS["contractor_portal_disabled"]() is False
    api.require_contractor_portal()


def test_contractor_portal_routes_fail_closed(monkeypatch):
    monkeypatch.delenv("ENABLE_CONTRACTOR_PORTAL", raising=False)
    client = TestClient(api.app)
    for path in (
        "/contractor/decision?work_order_id=1&contractor_id=1&decision=accept&token=x",
        "/contractor/availability?work_order_id=1&contractor_id=1&token=x",
        "/contractor/complete?work_order_id=1&contractor_id=1&token=x",
    ):
        response = client.get(path)
        assert response.status_code == 503
        assert "disabled" in response.text.lower()


def test_contractor_portal_links_empty_when_off(monkeypatch):
    monkeypatch.delenv("ENABLE_CONTRACTOR_PORTAL", raising=False)
    assert operations.contractor_portal_links(1) == {}
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "false")
    assert operations.contractor_portal_links(1) == {}
