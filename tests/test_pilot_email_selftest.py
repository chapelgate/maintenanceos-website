
def test_email_selftest_disabled_by_default(monkeypatch, tmp_path):
    monkeypatch.delenv("PILOT_EMAIL_SELFTEST_ON_BOOT", raising=False)
    monkeypatch.setenv("PILOT_EMAIL_SELFTEST_PATH", str(tmp_path / "marker.json"))
    from pilot.email_selftest import run_email_selftest_if_configured, selftest_status
    assert run_email_selftest_if_configured() is None
    assert selftest_status() is None
