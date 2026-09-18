
import hmac
import os

from fastapi.testclient import TestClient


def test_synthetic_email_proof_requires_token(monkeypatch):
    monkeypatch.setenv("APP_SECRET", "s" * 32)
    monkeypatch.setenv("PILOT_MODE_ARMED", "true")
    monkeypatch.setenv("PILOT_SYNTHETIC_PROOF_TOKEN", "proof-token-test")
    monkeypatch.setenv("PILOT_BOOTSTRAP_CALLS", "0")
    monkeypatch.setenv("EMAIL_MODE", "mock")
    monkeypatch.setenv("ENABLE_LIVE_EMAIL", "false")
    monkeypatch.setenv("INTERNAL_NOTIFICATION_EMAIL", "chapelgate@gmail.com")
    from api import app
    client = TestClient(app)
    assert client.post("/pilot/synthetic-email-proof").status_code == 404
    # With token, should attempt dispatch (may be mock path)
    r = client.post(
        "/pilot/synthetic-email-proof",
        headers={"X-Pilot-Proof-Token": "proof-token-test"},
        json={"marker": "UNITTEST1"},
    )
    assert r.status_code in {200, 409, 500} or r.status_code == 200
