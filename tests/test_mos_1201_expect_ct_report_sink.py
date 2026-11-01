from fastapi.testclient import TestClient

import api
import operational_logging as ol


def test_expect_ct_report_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setattr(ol, "operational_event", capture)
    monkeypatch.setattr(api, "operational_event", capture)
    client = TestClient(api.app)
    r = client.post("/ct-err", json={"expect-ct-report": [{"age": 1}]})
    assert r.status_code == 204
    assert any(
        name == "expect_ct_report" and fields.get("status") == 204 and fields.get("path") == "/ct-err"
        for name, fields in events
    )


def test_expect_ct_report_rejects_non_object_json():
    client = TestClient(api.app)
    r = client.post("/ct-err", content=b"[1]", headers={"content-type": "application/json"})
    assert r.status_code == 400


def test_expect_ct_report_get_not_allowed():
    client = TestClient(api.app)
    r = client.get("/ct-err")
    assert r.status_code == 405


def test_expect_ct_header_still_points_at_ct_err():
    import ingress_security as sec

    values = {name.decode(): value.decode() for name, value in sec.SECURITY_HEADERS}
    assert "report-uri=/ct-err" in values["expect-ct"]
