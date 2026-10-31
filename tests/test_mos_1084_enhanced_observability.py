import json
import logging

from fastapi.testclient import TestClient

import api
import operational_logging as ol
from request_context import clear_request_id, set_request_id


def test_health_correlation_id_present():
    client = TestClient(api.app)
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body.get("correlation_id")
    assert response.headers.get("x-correlation-id") == body["correlation_id"]
    assert response.headers.get("x-request-id") == body["correlation_id"]
    assert response.headers.get("x-csrf-token")


def test_health_correlation_id_propagated():
    supplied = "aabbccddeeff00112233445566778899"
    client = TestClient(api.app)
    response = client.get("/health", headers={"x-request-id": supplied})
    assert response.status_code == 200
    body = response.json()
    assert body["correlation_id"] == supplied
    assert response.headers.get("x-correlation-id") == supplied
    assert response.headers.get("x-request-id") == supplied
    assert response.headers.get("x-csrf-token")


def test_health_structured_json_output(monkeypatch, caplog):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    clear_request_id()
    set_request_id("corr-struct-00112233445566778899ab")
    with caplog.at_level(logging.INFO, logger="maintenanceos.operations"):
        ol.operational_event("health_probe", path="/health", status=200, outcome="ok")
    clear_request_id()
    records = [r for r in caplog.records if getattr(r, "event_name", "") == "health_probe"]
    assert records
    fields = records[0].event_fields
    assert fields["request_id"] == "corr-struct-00112233445566778899ab"
    assert fields["correlation_id"] == "corr-struct-00112233445566778899ab"
    payload = json.loads(ol.RedactedJsonFormatter().format(records[0]))
    assert payload["correlation_id"] == "corr-struct-00112233445566778899ab"
    assert payload["request_id"] == "corr-struct-00112233445566778899ab"
    assert "password" not in payload
