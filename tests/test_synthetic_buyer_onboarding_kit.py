from pathlib import Path

import readiness

KIT = Path(__file__).resolve().parents[1] / "docs" / "commercial_release" / "SYNTHETIC_BUYER_ONBOARDING_KIT.md"


def test_kit_file_exists_and_states_synthetic_only():
    text = KIT.read_text(encoding="utf-8")
    assert "SYNTHETIC ONLY" in text
    assert "live personal data" in text.lower() or "live personal data" in text
    assert "commercial_release_ready" in text
    assert "golden phone line" in text.lower()


def test_kit_forbids_sale_and_production_claims():
    text = KIT.read_text(encoding="utf-8").lower()
    assert "not a sale" in text
    assert "not a live onboarding" in text or "not live customer" in text
    assert "production credentials" in text or "production" in text
    assert "do not place a pstn call" in text or "do not place" in text


def test_readiness_stays_closed_with_kit_present(monkeypatch):
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    report = readiness.report()
    assert report["commercial_release_ready"] is False
    assert report["commercial_data_lifecycle_runtime"] is False
    assert report["commercial_external_identity_runtime"] is False
    assert KIT.is_file()
