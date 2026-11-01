from fastapi.testclient import TestClient

import api
import operational_logging as ol


def test_availability_invalid_link_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    monkeypatch.setattr(ol, "operational_event", capture)
    monkeypatch.setattr(api, "operational_event", capture)
    monkeypatch.setattr(api, "verify_link", lambda *a, **k: False)
    client = TestClient(api.app)
    r = client.get("/contractor/availability", params={
        "work_order_id": "1",
        "contractor_id": "1",
        "token": "bad",
    })
    assert r.status_code == 403
    assert any(
        name == "invalid_link"
        and fields.get("status") == 403
        and fields.get("action") == "availability"
        and fields.get("method") == "GET"
        for name, fields in events
    )


def test_invalid_link_helper_wired_on_portal_routes():
    import inspect

    source = inspect.getsource(api)
    assert source.count('_reject_invalid_link("decision"') == 2
    assert source.count('_reject_invalid_link("availability"') == 2
    assert source.count('_reject_invalid_link("complete"') == 2
