import readiness


def _all_checks(value=True):
    return {key: (lambda value=value: value) for key in readiness.CHECKS}


def test_public_test_profile_requires_ingress_disabled(monkeypatch):
    checks = _all_checks(True)
    checks["staged_database_configured"] = lambda: False
    checks["public_provider_ingress"] = lambda: False
    checks["public_provider_ingress_disabled"] = lambda: True
    checks["realtime_voice_enabled"] = lambda: False
    monkeypatch.setattr(readiness, "CHECKS", checks)
    monkeypatch.setattr(readiness, "provider_ready", lambda: False)
    report = readiness.report()
    assert report["public_test_config_ready"] is True
    assert report["controlled_call_config_ready"] is False


def test_controlled_call_profile_requires_live_ingress_and_voice(monkeypatch):
    checks = _all_checks(True)
    checks["staged_database_configured"] = lambda: False
    checks["public_provider_ingress"] = lambda: True
    checks["public_provider_ingress_disabled"] = lambda: False
    checks["realtime_voice_enabled"] = lambda: True
    monkeypatch.setattr(readiness, "CHECKS", checks)
    monkeypatch.setattr(readiness, "provider_ready", lambda: True)
    report = readiness.report()
    assert report["controlled_call_config_ready"] is True


def test_commercial_release_profile_requires_all_commercial_gates(monkeypatch):
    checks = _all_checks(True)
    checks["commercial_data_lifecycle_runtime"] = lambda: False
    monkeypatch.setattr(readiness, "CHECKS", checks)
    monkeypatch.setattr(readiness, "provider_ready", lambda: True)
    report = readiness.report()
    assert report["controlled_call_config_ready"] is True
    assert report["commercial_release_ready"] is False


def test_commercial_release_profile_can_only_pass_when_controlled_and_commercial_gates_pass(monkeypatch):
    checks = _all_checks(True)
    monkeypatch.setattr(readiness, "CHECKS", checks)
    monkeypatch.setattr(readiness, "provider_ready", lambda: True)
    report = readiness.report()
    assert report["commercial_release_ready"] is True
    assert readiness.PROFILE_KEYS["commercial-release"] == "commercial_release_ready"
