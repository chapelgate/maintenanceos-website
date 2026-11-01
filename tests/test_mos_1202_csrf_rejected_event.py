from fastapi.testclient import TestClient

import api
import operational_logging as ol


def test_availability_invalid_csrf_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setenv("ENABLE_CONTRACTOR_PORTAL", "true")
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    monkeypatch.setattr(ol, "operational_event", capture)
    monkeypatch.setattr(api, "operational_event", capture)
    monkeypatch.setattr(api, "verify_form_csrf", lambda *a, **k: False)
    monkeypatch.setattr(api, "verify_link", lambda *a, **k: True)
    client = TestClient(api.app)
    r = client.post(
        "/contractor/availability",
        data={
            "work_order_id": "1",
            "contractor_id": "1",
            "token": "tok",
            "start": "2030-01-01T10:00",
            "end": "2030-01-01T11:00",
            "csrf_token": "bad",
        },
    )
    assert r.status_code == 403
    assert any(
        name == "csrf_rejected"
        and fields.get("status") == 403
        and fields.get("action") == "availability"
        for name, fields in events
    )


def test_reject_helper_covers_all_portal_actions():
    import inspect

    source = inspect.getsource(api)
    assert source.count('_reject_invalid_csrf("decision")') == 1
    assert source.count('_reject_invalid_csrf("availability")') == 1
    assert source.count('_reject_invalid_csrf("complete")') == 1
