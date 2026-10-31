import product_profile
from fastapi.testclient import TestClient
import api


def test_product_profile_title_is_set(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert product_profile.api_title()
    assert product_profile.page_title()


def test_health_product_title_present(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    data = TestClient(api.app).get("/health").json()
    assert "product_title" in data
