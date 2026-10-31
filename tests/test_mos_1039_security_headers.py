from fastapi.testclient import TestClient

import api
from secret_patterns import SENSITIVE_KEY


def test_json_without_secret_leak():
    client = TestClient(api.app)
    r = client.get("/health")
    assert r.status_code == 200
    blob = str(r.json()).lower()
    assert "password" not in blob
    assert "token" not in blob
    assert "bearer" not in blob
    assert "sk-" not in blob
    assert "sk_live" not in blob
    assert "ghp_" not in blob
    assert "authorization" not in blob


def test_log_redact_pattern_matches_secret_keys():
    # Ensure SENSITIVE_KEY catches the secret keys we care about (per actual pattern)
    # Actual pattern: (?:authorization|body|caller|cookie|credential|detail|email|key|number|password|phone|secret|signature|token|transcript)
    secret_keys = [
        "password", "token", "secret", "key", "authorization", "credential",
        "signature", "transcript", "email", "phone", "number", "detail",
        "body", "caller", "cookie", "api_key", "apikey",
    ]
    for k in secret_keys:
        assert SENSITIVE_KEY.search(k), f"SENSITIVE_KEY missed {k}"
    # Should NOT match safe fields
    safe_keys = ["client_id", "status", "path", "method", "duration_ms", "outcome", "request_id", "transport"]
    for k in safe_keys:
        assert not SENSITIVE_KEY.search(k), f"SENSITIVE_KEY false positive on {k}"
