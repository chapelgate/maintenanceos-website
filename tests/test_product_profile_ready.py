import readiness


def test_product_profile_ready_is_in_checks_and_report(monkeypatch):
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)
    assert "product_profile_ready" in readiness.CHECKS
    assert "product_profile_ready" in readiness.LOCAL_CLOSED_KEYS
    assert "product_profile_ready" in readiness.PUBLIC_TEST_CONFIG_KEYS
    report = readiness.report()
    assert report["product_profile_ready"] is True


def test_invalid_product_profile_fails_ready_check(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "not-a-real-profile")
    assert readiness.CHECKS["product_profile_ready"]() is False
    report = readiness.report()
    assert report["product_profile_ready"] is False
    assert report["local_pre_live_ready"] is False


def test_release_banner_surfaces_bad_product_profile(monkeypatch):
    monkeypatch.setenv("PRODUCT_PROFILE", "not-a-real-profile")
    banner = readiness.release_status_banner({"commercial_release_ready": False, "product_profile_ready": False})
    assert banner["level"] == "warning"
    assert "product_profile_ready is false" in banner["body"]
    assert "SYNTHETIC ONLY" in banner["body"]
