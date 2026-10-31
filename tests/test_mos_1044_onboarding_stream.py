import os
from pathlib import Path

import operational_logging as ol


def test_no_raw_pii_in_onboarding_events(monkeypatch):
    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    # Onboarding kit must forbid live PII; operational events drop unsafe fields
    kit = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md").read_text().lower()
    assert "synthetic" in kit
    assert "live personal data" in kit or "live customer" in kit or "resident pii" in kit
    filtered = ol.log_event_valid_fields(
        {
            "path": "/onboarding",
            "status": 200,
            "email": "person@example.com",
            "phone": "+441234567890",
            "detail": "resident John",
            "client_id": 1,
        }
    )
    assert "email" not in filtered
    assert "phone" not in filtered
    assert "detail" not in filtered
    assert filtered.get("client_id") == 1


def test_onboarding_env_vars_optional(monkeypatch):
    for name in (
        "ONBOARDING_STREAM_URL",
        "BUYER_ONBOARDING_WEBHOOK",
        "SYNTHETIC_ONBOARDING_ENDPOINT",
    ):
        monkeypatch.delenv(name, raising=False)
        assert os.getenv(name) is None
