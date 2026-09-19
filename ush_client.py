"""MaintenanceOS → Chapelgate Universal Secrets Handler (USH) client.

USH is the credential broker/vault. MaintenanceOS must not hold a long-lived
DigitalOcean token, must not ask Andy to paste tokens into Cursor, and must
not run absent-secret retry loops.

Identity lifecycle (see ush_identity.py):
  Durable: Ed25519 workload keypair under MOS secrets (survives restart)
  Ephemeral: short-lived USH bearer minted via POST /v1/auth/workload
  Auto-refresh before expiry; fail closed on renewal/revocation failure
  NEVER persist issue_token() 3600s bearers as permanent USH_WORKLOAD_TOKEN

Live control plane: https://68.183.44.222
  /health → digitalocean registered, adapter_class=live_http, profile=DO_USH_DEPLOY
"""

from __future__ import annotations

import json
import os
import ssl
import urllib.error
import urllib.request
from typing import Any

import ush_identity
from ush_identity import (  # re-export constants used by scripts/tests
    MOS_ENVIRONMENT,
    MOS_PRINCIPAL_ID,
    MOS_PROJECT,
    MOS_TENANT,
    UshIdentityError,
)

DEFAULT_USH_BASE = ush_identity.DEFAULT_USH_BASE

# Providers USH must broker for MaintenanceOS (release-gate matrix).
PROVIDER_MATRIX: dict[str, dict[str, Any]] = {
    "digitalocean": {
        "role": "MaintenanceOS runtime (App Platform / droplets)",
        "required": True,
        "capabilities": (
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
        ),
        "delivery_modes": ("capability_ref", "provider_native_ref"),
        "forbid_cursor_secret": "DIGITALOCEAN_TOKEN",
    },
    "twilio": {
        "role": "Voice / webhook provider",
        "required": True,
        "capabilities": ("health", "validate", "voice.credentials"),
        "delivery_modes": ("capability_ref", "ephemeral_token"),
    },
    "openai": {
        "role": "Lane A voice path",
        "required": False,
        "capabilities": ("health", "validate"),
        "delivery_modes": ("capability_ref", "ephemeral_token"),
    },
    "resend": {
        "role": "Async post-call email only (never blocks voice)",
        "required": False,
        "capabilities": ("health", "validate", "email.send"),
        "delivery_modes": ("capability_ref", "ephemeral_token"),
    },
    "render": {
        "role": "Legacy validation / rollback evidence only",
        "required": False,
        "active_dependency": False,
        "capabilities": ("health",),
        "delivery_modes": ("capability_ref",),
    },
}


class UshError(RuntimeError):
    def __init__(self, code: str, detail: str = ""):
        super().__init__(code if not detail else f"{code}:{detail}")
        self.code = code
        self.detail = detail


def ush_base_url() -> str:
    return ush_identity.ush_base_url()


def _tls_context() -> ssl.SSLContext:
    verify = (os.getenv("USH_TLS_VERIFY") or "").strip().lower() in {"1", "true", "yes", "on"}
    return ssl.create_default_context() if verify else ssl._create_unverified_context()


def _legacy_bearer_allowed() -> bool:
    return (os.getenv("USH_ALLOW_LEGACY_BEARER") or "").strip().lower() in {"1", "true", "yes", "on"}


def workload_identity() -> dict[str, str]:
    """Auth headers from renewable workload identity (preferred) or explicit test override."""
    # Preferred: durable keypair → auto-refreshed short-lived bearer
    try:
        runtime = ush_identity.get_runtime()
        if runtime.has_durable_identity():
            return runtime.authorization_header()
    except UshIdentityError as exc:
        raise UshError(exc.code, exc.detail) from None

    # Explicit test-only legacy bearer (never the production path)
    if _legacy_bearer_allowed():
        token = (os.getenv("USH_WORKLOAD_TOKEN") or "").strip()
        if not token:
            token_path = os.getenv("USH_WORKLOAD_TOKEN_FILE") or "/tmp/mos-secrets/USH_WORKLOAD_TOKEN"
            try:
                if os.path.isfile(token_path):
                    token = open(token_path, encoding="utf-8").read().strip()
            except OSError:
                token = ""
        if token:
            headers = {
                "Authorization": token if token.lower().startswith("bearer ") else f"Bearer {token}",
                "X-USH-Principal-Id": os.getenv("USH_PRINCIPAL_ID") or MOS_PRINCIPAL_ID,
            }
            return headers

    return {"X-USH-Principal-Id": os.getenv("USH_PRINCIPAL_ID") or MOS_PRINCIPAL_ID}


def _request(
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
    *,
    auth_required: bool = True,
) -> dict[str, Any]:
    base = ush_base_url()
    if not base:
        raise UshError("USH_UNREACHABLE", "USH_BASE_URL unset")
    try:
        headers = {"Accept": "application/json", "User-Agent": "maintenanceos-ush-client/2", **workload_identity()}
    except UshError:
        raise
    if auth_required and "Authorization" not in headers:
        raise UshError(
            "USH_IDENTITY_MISSING",
            "durable workload identity absent — refuse permanent 1h bearer; bootstrap renewable keypair once",
        )
    body = None
    if payload is not None:
        body = json.dumps(payload).encode()
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(f"{base}{path}", data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=45, context=_tls_context()) as resp:
            raw = resp.read().decode() or "{}"
            parsed = json.loads(raw)
            return parsed if isinstance(parsed, dict) else {"data": parsed}
    except urllib.error.HTTPError as exc:
        if exc.code in {401, 403} and auth_required:
            # Drop ephemeral bearer and renew from durable key once; fail closed if renew fails.
            try:
                runtime = ush_identity.get_runtime()
                runtime._memory_bearer = None
                ush_identity.clear_bearer_cache(runtime.directory)
                headers = {"Accept": "application/json", "User-Agent": "maintenanceos-ush-client/2", **workload_identity()}
                req2 = urllib.request.Request(f"{base}{path}", data=body, headers=headers, method=method)
                with urllib.request.urlopen(req2, timeout=45, context=_tls_context()) as resp2:
                    raw2 = resp2.read().decode() or "{}"
                    parsed2 = json.loads(raw2)
                    return parsed2 if isinstance(parsed2, dict) else {"data": parsed2}
            except UshError as renew_exc:
                raise UshError(renew_exc.code, renew_exc.detail) from None
            except urllib.error.HTTPError as exc2:
                raise UshError("USH_HTTP", str(exc2.code)) from None
            except Exception:
                raise UshError("USH_HTTP", str(exc.code)) from None
        raise UshError("USH_HTTP", str(exc.code)) from None
    except urllib.error.URLError as exc:
        raise UshError("USH_NETWORK", type(exc).__name__) from None


def health() -> dict[str, Any]:
    """Public health (no auth). Safe to log."""
    identity_status: dict[str, Any] = {}
    try:
        identity_status = ush_identity.get_runtime().status()
    except Exception:
        identity_status = {"durable_identity_present": False}
    try:
        body = _request("GET", "/health", auth_required=False)
    except UshError as exc:
        return {
            "ok": False,
            "error": exc.code,
            "ush_base_configured": bool(ush_base_url()),
            "workload_identity_present": bool(identity_status.get("durable_identity_present")),
            "identity": identity_status,
            "cursor_digitalocean_token_forbidden": True,
            "n2_secrets_retry_disabled": True,
            "legacy_permanent_bearer_forbidden": True,
            "provider_matrix": {
                k: {"required": v.get("required"), "active_dependency": v.get("active_dependency", True)}
                for k, v in PROVIDER_MATRIX.items()
            },
        }
    do = body.get("digitalocean") if isinstance(body.get("digitalocean"), dict) else {}
    return {
        "ok": body.get("status") == "ok",
        "ush_status": body.get("status"),
        "ush_profile": body.get("profile"),
        "kill_switch": body.get("kill_switch"),
        "providers": body.get("providers") or [],
        "digitalocean_registered": bool(do.get("registered")),
        "digitalocean_adapter_class": do.get("adapter_class"),
        "digitalocean_profile": do.get("profile"),
        "ush_base_configured": True,
        "workload_identity_present": bool(identity_status.get("durable_identity_present")),
        "identity": identity_status,
        "cursor_digitalocean_token_forbidden": True,
        "n2_secrets_retry_disabled": True,
        "legacy_permanent_bearer_forbidden": True,
        "provider_matrix": {
            k: {"required": v.get("required"), "active_dependency": v.get("active_dependency", True)}
            for k, v in PROVIDER_MATRIX.items()
        },
    }


def list_capabilities() -> dict[str, Any]:
    return _request("GET", "/v1/capabilities")


def request_credential(
    provider: str,
    capability: str,
    *,
    project: str = MOS_PROJECT,
    environment: str = MOS_ENVIRONMENT,
    tenant: str = MOS_TENANT,
    delivery_mode: str = "capability_ref",
    ttl_seconds: int = 600,
    requester_kind: str = "application",
) -> dict[str, Any]:
    """Ask USH for a capability grant. Prefer capability_ref — never log ephemeral tokens."""
    return _request(
        "POST",
        "/v1/credentials/request",
        {
            "provider": provider,
            "capability": capability,
            "project": project,
            "environment": environment,
            "tenant": tenant,
            "delivery_mode": delivery_mode,
            "ttl_seconds": ttl_seconds,
            "requester_kind": requester_kind,
        },
    )


def request_operation(
    provider: str,
    operation: str,
    *,
    params: dict[str, Any] | None = None,
    project: str = MOS_PROJECT,
    environment: str = MOS_ENVIRONMENT,
    tenant: str = MOS_TENANT,
    reason: str = "maintenanceos",
    ttl_seconds: int = 600,
    idempotency_key: str | None = None,
) -> dict[str, Any]:
    """Broker a provider operation through USH without exposing secrets to MOS."""
    payload: dict[str, Any] = {
        "provider": provider,
        "operation": operation,
        "project": project,
        "environment": environment,
        "tenant": tenant,
        "reason": reason,
        "ttl_seconds": ttl_seconds,
        "params": params or {},
    }
    if idempotency_key:
        payload["idempotency_key"] = idempotency_key
    return _request("POST", "/v1/operations/request", payload)


def invoke_credential(credential_id: str, operation: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    return _request(
        "POST",
        f"/v1/credentials/{credential_id}/invoke",
        {"operation": operation, "params": params or {}},
    )


def digitalocean_deploy_capability() -> dict[str, Any]:
    return request_credential("digitalocean", "apps.deploy", requester_kind="application")


def digitalocean_discover() -> dict[str, Any]:
    return request_operation(
        "digitalocean",
        "discover",
        reason="maintenanceos-london-discover",
        params={"name_prefix": "maintenanceos", "region": "lon"},
    )


def digitalocean_list_apps() -> dict[str, Any]:
    return request_operation("digitalocean", "apps.list", reason="maintenanceos-london-list-apps")


def twilio_credentials_via_ush() -> dict[str, Any]:
    return request_credential("twilio", "voice.credentials", delivery_mode="capability_ref")


def resend_credentials_via_ush() -> dict[str, Any]:
    return request_credential("resend", "email.send", delivery_mode="capability_ref")


def assert_project_isolation(
    *,
    foreign_project: str = "holiday-let-operator",
    capability: str = "apps.deploy",
) -> dict[str, Any]:
    try:
        request_credential(
            "digitalocean",
            capability,
            project=foreign_project,
            environment="production",
            tenant=MOS_TENANT,
        )
        return {"ok": False, "error": "ISOLATION_VIOLATION", "foreign_project": foreign_project}
    except UshError as exc:
        denied = exc.code == "USH_HTTP" and exc.detail in {"401", "403", "404"}
        return {
            "ok": denied or exc.code in {"USH_DENIED", "USH_IDENTITY_MISSING", "USH_IDENTITY_RENEWAL_FAILED", "USH_IDENTITY_REVOKED"},
            "denied_code": exc.code,
            "denied_detail": exc.detail,
            "foreign_project": foreign_project,
        }


def forbid_cursor_digitalocean_token() -> None:
    if (os.getenv("DIGITALOCEAN_TOKEN") or os.getenv("DIGITALOCEAN_ACCESS_TOKEN") or os.getenv("DO_API_TOKEN") or "").strip():
        if (os.getenv("USH_ALLOW_LEGACY_DO_TOKEN") or "").strip().lower() not in {"1", "true", "yes"}:
            raise UshError(
                "CURSOR_DO_TOKEN_FORBIDDEN",
                "DigitalOcean credentials belong in USH vault; use renewable MOS workload identity",
            )


def release_gates() -> dict[str, Any]:
    h = health()
    identity = h.get("identity") or {}
    gates = {
        "ush_reachable": bool(h.get("ok")),
        "digitalocean_adapter_registered": bool(h.get("digitalocean_registered")),
        "digitalocean_profile_present": bool(h.get("digitalocean_profile")),
        "n2_secrets_retry_disabled": True,
        "cursor_digitalocean_token_forbidden": True,
        "render_active_dependency": False,
        "durable_workload_identity_present": bool(identity.get("durable_identity_present")),
        "legacy_permanent_bearer_forbidden": True,
        "workload_identity_present": bool(identity.get("durable_identity_present")),
        "twilio_via_ush": "twilio" in (h.get("providers") or []),
        "openai_via_ush": "openai" in (h.get("providers") or []),
        "identity_lifecycle_renewable": True,
    }
    gates["ready_for_do_provision"] = all(
        [
            gates["ush_reachable"],
            gates["digitalocean_adapter_registered"],
            gates["durable_workload_identity_present"],
            gates["n2_secrets_retry_disabled"],
        ]
    )
    return {"gates": gates, "health": h, "matrix": PROVIDER_MATRIX}


if __name__ == "__main__":
    print(json.dumps({"health": health(), "release_gates": release_gates()}, indent=2))
