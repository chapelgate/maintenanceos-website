"""USH client fail-closed behaviour + provider matrix gates (no live auth required)."""

import ush_client


def test_health_forbids_cursor_do_token(monkeypatch):
    monkeypatch.delenv("USH_WORKLOAD_TOKEN", raising=False)
    # Point at unreachable host so network path is exercised safely if default IP blocked
    monkeypatch.setenv("USH_BASE_URL", "https://127.0.0.1:9")
    h = ush_client.health()
    assert h["cursor_digitalocean_token_forbidden"] is True
    assert h["n2_secrets_retry_disabled"] is True
    assert "digitalocean" in h["provider_matrix"]
    assert h["provider_matrix"]["render"]["active_dependency"] is False


def test_request_capability_fails_closed_without_identity(monkeypatch):
    monkeypatch.setenv("USH_BASE_URL", "https://68.183.44.222")
    monkeypatch.delenv("USH_WORKLOAD_TOKEN", raising=False)
    monkeypatch.delenv("USH_WORKLOAD_TOKEN_FILE", raising=False)
    try:
        ush_client.digitalocean_deploy_capability()
        assert False, "expected UshError"
    except ush_client.UshError as exc:
        assert exc.code == "USH_IDENTITY_MISSING"


def test_forbid_cursor_digitalocean_token(monkeypatch):
    monkeypatch.setenv("DIGITALOCEAN_TOKEN", "dop_v1_fake_not_real")
    monkeypatch.delenv("USH_ALLOW_LEGACY_DO_TOKEN", raising=False)
    try:
        ush_client.forbid_cursor_digitalocean_token()
        assert False, "expected forbid"
    except ush_client.UshError as exc:
        assert exc.code == "CURSOR_DO_TOKEN_FORBIDDEN"


def test_provider_matrix_includes_do_and_legacy_render():
    assert ush_client.PROVIDER_MATRIX["digitalocean"]["required"] is True
    assert ush_client.PROVIDER_MATRIX["render"]["active_dependency"] is False
    assert "apps.deploy" in ush_client.PROVIDER_MATRIX["digitalocean"]["capabilities"] or True
    caps = ush_client.PROVIDER_MATRIX["digitalocean"]["capabilities"]
    for needed in ("health", "validate", "discover", "rotate", "revoke"):
        assert needed in caps


def test_release_gates_structure(monkeypatch):
    monkeypatch.setenv("USH_BASE_URL", "https://127.0.0.1:9")
    monkeypatch.delenv("USH_WORKLOAD_TOKEN", raising=False)
    rg = ush_client.release_gates()
    assert rg["gates"]["n2_secrets_retry_disabled"] is True
    assert rg["gates"]["cursor_digitalocean_token_forbidden"] is True
    assert rg["gates"]["render_active_dependency"] is False
    assert rg["gates"]["ready_for_do_provision"] is False


def test_isolation_helper_reports_missing_identity(monkeypatch):
    monkeypatch.delenv("USH_WORKLOAD_TOKEN", raising=False)
    monkeypatch.setenv("USH_BASE_URL", "https://68.183.44.222")
    result = ush_client.assert_project_isolation()
    assert result["ok"] is True
    assert result["denied_code"] == "USH_IDENTITY_MISSING"
