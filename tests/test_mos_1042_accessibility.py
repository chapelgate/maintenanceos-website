import product_profile


def test_api_title_returns_string(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert isinstance(product_profile.api_title(), str)


def test_product_profile_module_loads():
    assert product_profile.ALLOWED_PROFILES
    assert callable(product_profile.api_title)
    assert callable(product_profile.page_title)
