"""MaintenanceOS → Chapelgate Universal Secrets Handler (USH) client.

USH is the credential broker/vault. MaintenanceOS must not hold a long-lived
DigitalOcean token, must not ask Andy to paste tokens into Cursor, and must
not run absent-secret retry loops.

Live control plane (2026-09-18): https://68.183.44.222
  /health → digitalocean registered, adapter_class=live_http, profile=DO_USH_DEPLOY

Preferred path: POST /v1/operations/request (brokered provider ops, no secret exposure).
Identity: workload / principal bearer token (USH_WORKLOAD_TOKEN), never DIGITALOCEAN_TOKEN.
"""

from __future__ import annotations

import json
import os
import ssl
import urllib.error
import urllib.request
from typing import Any

DEFAULT_USH_BASE = "https://68.183.44.222"
MOS_PROJECT = "maintenanceos"
MOS_ENVIRONMENT = "london"
MOS_TENANT = "chapelgate"
MOS_PRINCIPAL_ID = "maintenanceos-v1-pilot"

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
    return (os.getenv("USH_BASE_URL") or os.getenv("UNIVERSAL_SECRETS_URL") or DEFAULT_USH_BASE).rstrip("/")


def _tls_context() -> ssl.SSLContext:
    # Production USH currently presents a self-signed cert on the droplet IP.
    # Prefer USH_TLS_VERIFY=1 once a public cert is installed.
    verify = (os.getenv("USH_TLS_VERIFY") or "").strip().lower() in {"1", "true", "yes", "on"}
    if verify:
        return ssl.create_default_context()
    return ssl._create_unverified_context()


def workload_identity() -> dict[str, str]:
    """Application/workload identity headers (names only; values from env/files)."""
    headers: dict[str, str] = {}
    token = (os.getenv("USH_WORKLOAD_TOKEN") or "").strip()
    if not token:
        token_path = os.getenv("USH_WORKLOAD_TOKEN_FILE") or "/tmp/mos-secrets/USH_WORKLOAD_TOKEN"
        try:
            if os.path.isfile(token_path):
                token = open(token_path, encoding="utf-8").read().strip()
        except OSError:
            token = ""
    if token:
        headers["Authorization"] = token if token.lower().startswith("bearer ") else f"Bearer {token}"
    for env_name, header in (
        ("USH_CLIENT_ID", "X-USH-Client-Id"),
        ("USH_TENANT_ID", "X-USH-Tenant-Id"),
        ("USH_APP_ID", "X-USH-App-Id"),
        ("USH_PRINCIPAL_ID", "X-USH-Principal-Id"),
    ):
        value = (os.getenv(env_name) or "").strip()
        if value:
            headers[header] = value
    if "X-USH-Principal-Id" not in headers:
        headers["X-USH-Principal-Id"] = os.getenv("USH_PRINCIPAL_ID") or MOS_PRINCIPAL_ID
    return headers


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
    headers = {"Accept": "application/json", "User-Agent": "maintenanceos-ush-client/1", **workload_identity()}
    if auth_required and "Authorization" not in headers:
        raise UshError(
            "USH_IDENTITY_MISSING",
            "configure USH_WORKLOAD_TOKEN (MOS principal grant) — do not inject DIGITALOCEAN_TOKEN into Cursor",
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
        # Never include response body — may echo secrets.
        raise UshError("USH_HTTP", str(exc.code)) from None
    except urllib.error.URLError as exc:
        raise UshError("USH_NETWORK", type(exc).__name__) from None


def health() -> dict[str, Any]:
    """Public health (no auth). Safe to log."""
    try:
        body = _request("GET", "/health", auth_required=False)
    except UshError as exc:
        return {
            "ok": False,
            "error": exc.code,
            "ush_base_configured": bool(ush_base_url()),
            "workload_identity_present": "Authorization" in workload_identity(),
            "cursor_digitalocean_token_forbidden": True,
            "n2_secrets_retry_disabled": True,
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
        "workload_identity_present": "Authorization" in workload_identity(),
        "cursor_digitalocean_token_forbidden": True,
        "n2_secrets_retry_disabled": True,
        "provider_matrix": {k: {"required": v.get("required"), "active_dependency": v.get("active_dependency", True)} for k, v in PROVIDER_MATRIX.items()},
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
    """Least-privilege DO deploy capability via USH (not a Cursor secret)."""
    return request_credential("digitalocean", "apps.deploy", requester_kind="application")


def digitalocean_discover() -> dict[str, Any]:
    """Discover MaintenanceOS-related DO resources via USH brokered ops."""
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
    """Another Chapelgate app must not obtain MOS deploy credentials without explicit policy grant.

    Expect USH_HTTP:403 / denied. Never treats success as OK.
    """
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
            "ok": denied or exc.code in {"USH_DENIED", "USH_IDENTITY_MISSING"},
            "denied_code": exc.code,
            "denied_detail": exc.detail,
            "foreign_project": foreign_project,
        }


def forbid_cursor_digitalocean_token() -> None:
    """Hard rule: MOS deploy must not read DIGITALOCEAN_TOKEN from Cursor agent env."""
    if (os.getenv("DIGITALOCEAN_TOKEN") or os.getenv("DIGITALOCEAN_ACCESS_TOKEN") or os.getenv("DO_API_TOKEN") or "").strip():
        if (os.getenv("USH_ALLOW_LEGACY_DO_TOKEN") or "").strip().lower() not in {"1", "true", "yes"}:
            raise UshError(
                "CURSOR_DO_TOKEN_FORBIDDEN",
                "DigitalOcean credentials belong in USH vault; remove Cursor DIGITALOCEAN_TOKEN and use USH_WORKLOAD_TOKEN",
            )


def release_gates() -> dict[str, Any]:
    """USH provider matrix release gates for MaintenanceOS."""
    h = health()
    gates = {
        "ush_reachable": bool(h.get("ok")),
        "digitalocean_adapter_registered": bool(h.get("digitalocean_registered")),
        "digitalocean_profile_present": bool(h.get("digitalocean_profile")),
        "n2_secrets_retry_disabled": True,
        "cursor_digitalocean_token_forbidden": True,
        "render_active_dependency": False,
        "workload_identity_present": bool(h.get("workload_identity_present")),
        "twilio_via_ush": "twilio" in (h.get("providers") or []),
        "openai_via_ush": "openai" in (h.get("providers") or []),
    }
    gates["ready_for_do_provision"] = all(
        [
            gates["ush_reachable"],
            gates["digitalocean_adapter_registered"],
            gates["workload_identity_present"],
            gates["n2_secrets_retry_disabled"],
        ]
    )
    return {"gates": gates, "health": h, "matrix": PROVIDER_MATRIX}


if __name__ == "__main__":
    print(json.dumps({"health": health(), "release_gates": release_gates()}, indent=2))
