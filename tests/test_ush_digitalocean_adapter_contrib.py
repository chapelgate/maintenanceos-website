"""Contract tests for the USH DigitalOcean adapter contribution (no live DO calls)."""

from contrib.ush_digitalocean_adapter_loader import load_adapter


def test_capability_catalogue():
    adapter = load_adapter()
    disc = adapter.discover_capabilities()
    assert disc["provider"] == "digitalocean"
    for cap in ("health", "validate", "discover", "apps.list", "rotate", "revoke"):
        assert adapter.supports(cap)


def test_health_fail_closed_without_vault():
    adapter = load_adapter()
    h = adapter.health(authorization_header_present=False)
    assert h["ok"] is False
    assert h["error"] == "vault_credential_missing"


def test_health_dry_run_with_vault_flag():
    adapter = load_adapter()
    h = adapter.health(authorization_header_present=True)
    assert h["ok"] is True
    assert h["mode"] == "dry_run"
