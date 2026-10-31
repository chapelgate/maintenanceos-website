from fastapi.testclient import TestClient

import api


def test_error_body_includes_correlation_id():
    client = TestClient(api.app)
    r = client.get("/no-such-mos-1190")
    assert r.status_code == 404
    body = r.json()
    assert "detail" in body
    assert body.get("correlation_id")
    assert body["correlation_id"] == r.headers.get("x-request-id")


def test_error_body_includes_correlation_id_with_auth():
    client = TestClient(api.app)
    r = client.post("/work-orders", json={})
    assert r.status_code in {401, 503}
    body = r.json()
    assert body.get("correlation_id")
    assert body["correlation_id"] == r.headers.get("x-request-id")


def test_supplied_request_id_appears_in_error_body():
    supplied = "aabbccddeeff00112233445566778899"
    client = TestClient(api.app)
    r = client.get("/no-such-mos-1190", headers={"x-request-id": supplied})
    assert r.status_code == 404
    body = r.json()
    assert body.get("correlation_id") == supplied
    assert r.headers.get("x-request-id") == supplied
