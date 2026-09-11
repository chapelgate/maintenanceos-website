import importlib


def _reload(monkeypatch, **env):
    for name in (
        "RSFM_INTEGRATION_ENABLED",
        "RSFM_CONTROL_PLANE_URL",
        "RSFM_AI_RECEPTIONIST_TOKEN",
        "RSFM_EMAIL_ADMIN_AGENT_TOKEN",
        "RSFM_TENANT_ID",
    ):
        monkeypatch.delenv(name, raising=False)
    for name, value in env.items():
        monkeypatch.setenv(name, value)
    import rsfm_embedded_agents
    return importlib.reload(rsfm_embedded_agents)


def test_embedded_agents_disabled_by_default(monkeypatch):
    bridge = _reload(monkeypatch)
    assert bridge.heartbeat("ai-receptionist", "healthy") is False
    assert bridge.heartbeat("email-admin-agent", "healthy") is False


def test_authoritative_records_rejected(monkeypatch):
    bridge = _reload(monkeypatch)
    assert bridge.publish_record("ai-receptionist", "authoritative", "call", {}) is False
    assert bridge.publish_record("email-admin-agent", "authoritative", "email", {}) is False


def test_unknown_app_rejected(monkeypatch):
    bridge = _reload(monkeypatch, RSFM_INTEGRATION_ENABLED="1", RSFM_CONTROL_PLANE_URL="https://example.invalid")
    assert bridge.publish_memory("unknown-agent", "x", {}) is False


def test_each_app_requires_its_own_token(monkeypatch):
    bridge = _reload(
        monkeypatch,
        RSFM_INTEGRATION_ENABLED="1",
        RSFM_CONTROL_PLANE_URL="https://example.invalid",
        RSFM_AI_RECEPTIONIST_TOKEN="r" * 40,
    )
    assert bridge._config("ai-receptionist") is not None
    assert bridge._config("email-admin-agent") is None
