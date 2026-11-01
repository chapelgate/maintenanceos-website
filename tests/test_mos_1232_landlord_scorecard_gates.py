import landlord_vertical_selector as lvs


def test_scorecard_fail_closed_by_default(monkeypatch):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    monkeypatch.delenv("COMMERCIAL_MARKET_SCOPE", raising=False)
    monkeypatch.delenv("LANDLORD_PILOT_DATA_MODE", raising=False)
    card = lvs.e2e_scorecard()
    assert card["vertical"] == "none"
    assert card["market_scope_ok"] is False
    assert card["synthetic_data_ok"] is False
    assert card["landlord_guard_active"] is False
    assert card["synthetic"] is True
    assert card["no_live_pii"] is True


def test_scorecard_active_only_when_all_gates_pass(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "uk-non-social-housing")
    monkeypatch.setenv("LANDLORD_PILOT_DATA_MODE", "synthetic")
    card = lvs.e2e_scorecard()
    assert card["vertical"] == "landlord"
    assert card["market_scope_ok"] is True
    assert card["synthetic_data_ok"] is True
    assert card["landlord_guard_active"] is True


def test_social_housing_scope_rejected(monkeypatch):
    monkeypatch.setenv("COMMERCIAL_MARKET_SCOPE", "england-social-housing")
    assert lvs.market_scope_ok() is False
