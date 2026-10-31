import operational_logging as ol
from fastapi.testclient import TestClient
import api


def test_structured_logging_enabled_flag_default_false(monkeypatch):
    monkeypatch.delenv("ENABLE_STRUCTURED_LOGGING", raising=False)
    assert ol.structured_logging_enabled() is False


def test_redacted_json_formatter_exists():
    assert hasattr(ol, "RedactedJsonFormatter")


def test_health_exposes_no_secret_metrics():
    blob = str(TestClient(api.app).get("/health").json()).lower()
    assert "password" not in blob
    assert "token" not in blob
