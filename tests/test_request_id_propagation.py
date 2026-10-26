import inspect
import json
import logging
from unittest.mock import MagicMock, patch

import operational_logging
import operations
from request_context import clear_request_id, request_id, set_request_id


def test_context_round_trip():
    clear_request_id()
    assert request_id() == ""
    set_request_id("abc123def456abc123def456abc123de")
    assert request_id() == "abc123def456abc123def456abc123de"
    clear_request_id()
    assert request_id() == ""


def test_audit_merges_request_id_into_json_detail():
    clear_request_id()
    set_request_id("corr-audit-001")
    session = MagicMock()
    operations.audit(session, None, "tester", "UNIT_TEST", json.dumps({"client_id": 1}, sort_keys=True))
    clear_request_id()
    event = session.add.call_args[0][0]
    detail = json.loads(event.detail)
    assert detail["client_id"] == 1
    assert detail["request_id"] == "corr-audit-001"


def test_operational_event_injects_request_id(monkeypatch):
    clear_request_id()
    set_request_id("corr-ops-001")
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    captured = {}

    def fake_info(msg, *args, **kwargs):
        captured.update(kwargs.get("extra", {}))

    with patch.object(operational_logging.LOGGER, "info", side_effect=fake_info):
        operational_logging.operational_event("unit_probe", method="GET", path="/health")
    clear_request_id()
    assert captured["event_fields"]["request_id"] == "corr-ops-001"
    assert captured["event_fields"]["method"] == "GET"


def test_ingress_sets_and_clears_context():
    source = inspect.getsource(__import__("ingress_security").HttpSecurityBoundary.__call__)
    assert "set_request_id(request_id)" in source
    assert "clear_request_id()" in source
