from fastapi.testclient import TestClient

import api


def _assert_matching_correlation(response):
    request_id = response.headers.get("x-request-id")
    correlation_id = response.headers.get("x-correlation-id")
    assert request_id
    assert correlation_id == request_id


def test_health_emits_matching_correlation_headers():
    client = TestClient(api.app)
    response = client.get("/health")
    assert response.status_code == 200
    _assert_matching_correlation(response)
    assert response.json()["correlation_id"] == response.headers["x-correlation-id"]


def test_not_found_emits_matching_correlation_headers():
    client = TestClient(api.app)
    response = client.get("/no-such-mos-1188")
    assert response.status_code == 404
    _assert_matching_correlation(response)


def test_auth_error_emits_matching_correlation_headers():
    client = TestClient(api.app)
    response = client.post("/work-orders", json={})
    assert response.status_code in {401, 503}
    _assert_matching_correlation(response)


def test_supplied_request_id_propagates_to_correlation_on_error():
    supplied = "aabbccddeeff00112233445566778899"
    client = TestClient(api.app)
    response = client.get("/no-such-mos-1188", headers={"x-request-id": supplied})
    assert response.status_code == 404
    assert response.headers.get("x-request-id") == supplied
    assert response.headers.get("x-correlation-id") == supplied
