"""Incident linking observability tests."""
from fastapi.testclient import TestClient
import api


def test_incident_link_key_max_is_200():
    assert api.INCIDENT_LINK_KEY_MAX == 200


def test_health_incident_link_allowlisted():
    body = TestClient(api.app).get("/health").json()
    assert "incident_link" in body
    assert body["incident_link"]["key_max"] == api.INCIDENT_LINK_KEY_MAX
    assert body["incident_link"]["ready"] is True
    assert set(body) == set(api.HEALTH_TOP_LEVEL_KEYS)
    assert "incident_link" in api.HEALTH_TOP_LEVEL_KEYS
