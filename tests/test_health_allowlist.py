import re

from fastapi.testclient import TestClient

import api

SECRET_LIKE = re.compile(
    r"(authorization|password|secret|token|api[_-]?key|cookie|credential|private[_-]?key)",
    re.IGNORECASE,
)


def _walk_keys(value, found):
    if isinstance(value, dict):
        for key, item in value.items():
            found.append(str(key))
            _walk_keys(item, found)
    elif isinstance(value, list):
        for item in value:
            _walk_keys(item, found)


def test_health_top_level_and_capacity_keys_are_allowlisted():
    body = TestClient(api.app).get("/health").json()
    assert set(body) == set(api.HEALTH_TOP_LEVEL_KEYS)
    assert set(body["call_capacity"]) == set(api.HEALTH_CALL_CAPACITY_KEYS)
    assert set(body["tenant_health"]) == set(api.TENANT_HEALTH_KEYS)


def test_health_body_has_no_secret_like_keys():
    body = TestClient(api.app).get("/health").json()
    keys = []
    _walk_keys(body, keys)
    offenders = [key for key in keys if SECRET_LIKE.search(key)]
    assert offenders == []


def test_health_ok_and_version_types():
    body = TestClient(api.app).get("/health").json()
    assert body["ok"] is True
    assert isinstance(body["version"], str) and body["version"]
    assert isinstance(body["realtime_voice"], bool)
    assert isinstance(body["active_calls"], int)
    assert isinstance(body["call_capacity"], dict)
    assert isinstance(body["pilot"], dict)
    tenant_health = body["tenant_health"]
    assert tenant_health["data_scope"] == "process-local"
    assert all(isinstance(tenant_health[key], int) for key in (
        "open_jobs",
        "closed_jobs",
        "p1_jobs",
        "repeat_repairs",
        "open_sla_breaches",
        "unresolved_exceptions",
    ))
    assert isinstance(tenant_health["avg_close_hours"], float)
    assert isinstance(tenant_health["human_intervention_rate"], float)
