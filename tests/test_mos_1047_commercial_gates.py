import product_profile
import commercial_release_controls as crc


def test_data_lifecycle_runtime_not_ready():
    assert crc.data_lifecycle_runtime_ready() is False


def test_external_identity_runtime_not_ready():
    assert crc.external_identity_runtime_ready() is False


def test_social_housing_runtime_not_ready(monkeypatch):
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    assert crc.social_housing_runtime_ready() is False


def test_profile_ready_check(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.profile_ready() is True
    monkeypatch.setenv("PRODUCT_PROFILE", "nope")
    assert product_profile.profile_ready() is False


def test_profile_available_in_allowed_set():
    assert product_profile.ALLOWED_PROFILES == {"maintenanceos", "worksmartos"}
