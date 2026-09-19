"""Reference DigitalOcean provider adapter surface for USH.

This is a contract mirror for MaintenanceOS + release gates. The live adapter
runs inside USH (`adapter_class=live_http`). When the USH repo is available to
this environment, port this module into USH's provider package and wire it into
the provider registry / release matrix.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

DO_API = "https://api.digitalocean.com/v2"

# Least-privilege capability catalogue exposed to USH policy.
CAPABILITIES: tuple[str, ...] = (
    "health",
    "validate",
    "discover",
    "apps.list",
    "apps.get",
    "apps.create",
    "apps.update",
    "droplets.list",
    "rotate",
    "revoke",
)

RELEASE_GATES: dict[str, Any] = {
    "provider": "digitalocean",
    "adapter_class": "live_http",
    "profiles": ("DO_READONLY", "DO_USH_DEPLOY"),
    "capabilities": CAPABILITIES,
    "required_for": ("maintenanceos",),
    "forbidden_cross_project_default": True,
}


@dataclass
class DigitalOceanAdapter:
    """USH-facing adapter: all HTTP to DO uses vaulted token held only by USH."""

    profile: str = "DO_USH_DEPLOY"
    http_get: Callable[[str, dict[str, str]], tuple[int, dict[str, Any]]] | None = None
    capabilities: tuple[str, ...] = field(default_factory=lambda: CAPABILITIES)

    def discover_capabilities(self) -> dict[str, Any]:
        return {
            "provider": "digitalocean",
            "profile": self.profile,
            "capabilities": list(self.capabilities),
            "api": DO_API,
            "release_gates": RELEASE_GATES,
        }

    def health(self, *, authorization_header_present: bool) -> dict[str, Any]:
        if not authorization_header_present:
            return {"ok": False, "error": "vault_credential_missing", "profile": self.profile}
        if self.http_get is None:
            return {"ok": True, "mode": "dry_run", "profile": self.profile}
        status, body = self.http_get(f"{DO_API}/account", {})
        return {
            "ok": status == 200,
            "http_status": status,
            "account_status": (body.get("account") or {}).get("status") if isinstance(body, dict) else None,
            "profile": self.profile,
        }

    def validate(self, *, authorization_header_present: bool) -> dict[str, Any]:
        h = self.health(authorization_header_present=authorization_header_present)
        h["validated"] = bool(h.get("ok"))
        return h

    def supports(self, capability: str) -> bool:
        return capability in self.capabilities
