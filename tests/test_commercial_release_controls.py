import json

import commercial_release_controls as crc


def _valid_retention():
    return {name: index + 1 for index, name in enumerate(crc.REQUIRED_RETENTION_CLASSES)}


def test_retention_policy_has_no_defaults_and_fails_closed(monkeypatch):
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    assert crc.retention_policy() is None
    assert crc.retention_policy_configured() is False


def test_retention_policy_requires_exact_positive_integer_classes(monkeypatch):
    valid = _valid_retention()
    monkeypatch.setenv("DATA_RETENTION_POLICY_JSON", json.dumps(valid))
    policy = crc.retention_policy()
    assert policy is not None
    assert crc.retention_policy_configured() is True
    assert set(policy.retention) == set(crc.REQUIRED_RETENTION_CLASSES)

    missing = dict(valid)
    missing.pop("backup_copy")
    monkeypatch.setenv("DATA_RETENTION_POLICY_JSON", json.dumps(missing))
    assert crc.retention_policy_configured() is False

    invalid = dict(valid)
    invalid["call_transcript"] = 0
    monkeypatch.setenv("DATA_RETENTION_POLICY_JSON", json.dumps(invalid))
    assert crc.retention_policy_configured() is False


def test_external_identity_configuration_requires_complete_managed_contract(monkeypatch):
    monkeypatch.setenv("EXTERNAL_IDENTITY_MODE", "oidc")
    for name in (
        "EXTERNAL_IDENTITY_ISSUER",
        "EXTERNAL_IDENTITY_AUDIENCE",
        "EXTERNAL_IDENTITY_TENANT_CLAIM",
        "EXTERNAL_IDENTITY_ROLE_CLAIM",
        "EXTERNAL_IDENTITY_ASSURANCE_CLAIM",
    ):
        monkeypatch.setenv(name, name.lower())
    assert crc.external_identity_configured() is True

    monkeypatch.delenv("EXTERNAL_IDENTITY_ROLE_CLAIM")
    assert crc.external_identity_configured() is False

    monkeypatch.setenv("EXTERNAL_IDENTITY_ROLE_CLAIM", "roles")
    monkeypatch.setenv("EXTERNAL_IDENTITY_MODE", "local-passwords")
    assert crc.external_identity_configured() is False


def test_runtime_gates_do_not_claim_isolated_cores_are_production_integrations():
    assert crc.data_lifecycle_runtime_ready() is False
    assert crc.external_identity_runtime_ready() is False


def test_market_scope_must_be_explicit_and_social_housing_fails_closed(monkeypatch):
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    assert crc.social_housing_runtime_ready() is False

    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "uk-non-social-housing")
    assert crc.social_housing_runtime_ready() is True

    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "england-social-housing")
    assert crc.social_housing_runtime_ready() is False

    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "unknown")
    assert crc.social_housing_runtime_ready() is False
