import commercial_release_controls as crc


def test_retention_policy_configured_is_false(monkeypatch):
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    assert crc.retention_policy_configured() is False


def test_no_default_durations_until_configured(monkeypatch):
    monkeypatch.delenv("DATA_RETENTION_POLICY_JSON", raising=False)
    assert crc.retention_policy() is None
