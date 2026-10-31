import commercial_release_controls as crc


def test_lifecycle_runtime_fail_closed():
    assert crc.data_lifecycle_runtime_ready() is False


def test_identity_runtime_fail_closed():
    assert crc.external_identity_runtime_ready() is False


def test_social_housing_runtime_fail_closed(monkeypatch):
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    assert crc.social_housing_runtime_ready() is False
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "england-social-housing")
    assert crc.social_housing_runtime_ready() is False


def test_retention_policy_configured(monkeypatch):
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    assert crc.retention_policy_configured() is False
