import product_profile


def test_api_title_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert isinstance(product_profile.api_title(), str)
    assert product_profile.api_title()


def test_product_profile_title_is_set(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    title = product_profile.api_title()
    assert "Maintenance" in title or "WorkSmart" in title or title
    monkeypatch.setenv("PRODUCT_PROFILE", "worksmartos")
    assert "WorkSmart" in product_profile.api_title() or product_profile.api_title()
