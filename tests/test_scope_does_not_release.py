import readiness


def test_non_social_scope_does_not_make_commercial_release_ready(monkeypatch):
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "uk-non-social-housing")
    report = readiness.report()
    assert report["commercial_data_lifecycle_runtime"] is False
    assert report["commercial_external_identity_runtime"] is False
    assert report["commercial_release_ready"] is False


def test_social_housing_scope_stays_closed(monkeypatch):
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "england-social-housing")
    report = readiness.report()
    assert report["commercial_social_housing_runtime"] is False
    assert report["commercial_release_ready"] is False


def test_unset_scope_stays_closed(monkeypatch):
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    report = readiness.report()
    assert report["commercial_social_housing_runtime"] is False
    assert report["commercial_release_ready"] is False
