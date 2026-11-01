import json
import logging

import operational_logging as ol


def test_action_is_safe_event_field():
    assert "action" in ol.SAFE_EVENT_FIELDS
    assert "token" not in ol.SAFE_EVENT_FIELDS
    assert "password" not in ol.SAFE_EVENT_FIELDS


def test_formatter_keeps_action_drops_secrets():
    record = logging.LogRecord(
        name="maintenanceos.operations",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="operational_event",
        args=(),
        exc_info=None,
    )
    record.event_name = "csrf_rejected"
    record.event_fields = {
        "action": "availability",
        "status": 403,
        "token": "secret-value",
        "password": "nope",
    }
    payload = json.loads(ol.RedactedJsonFormatter().format(record))
    assert payload["action"] == "availability"
    assert payload["status"] == 403
    assert "token" not in payload
    assert "password" not in payload
