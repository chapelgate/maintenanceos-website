"""Boolean-only Render inventory for MaintenanceOS controlled-call readiness.

Reads RENDER_API_KEY from the operator environment. Never prints credential
values, phone numbers, connection strings, or the API key. Does not touch HLO
or any non-MaintenanceOS product. Default mode is read-only.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from typing import Any, Callable
from urllib.parse import urlsplit

import httpx

RENDER_API = "https://api.render.com"
TARGET_SERVICE_NAME = "maintenanceos-redteam-v2"
PUBLIC_HEALTH_URL = "https://maintenanceos-redteam-v2.onrender.com/health"
EXPECTED_PUBLIC_BASE_URL = "https://maintenanceos-redteam-v2.onrender.com"
OWNER_SERVICE_IDS = ("srv-dahhskafngtc739pnplg",)
OWNER_WORKSPACE_IDS = ("tea-dah7d4h5efls738bode0",)
HLO_NAME_MARKERS = ("hlo", "holiday-let", "holiday_let", "holidaylet", "holiday let")
MOS_NAME_MARKERS = ("maintenanceos", "maintenance-os", "maintenance_os")
PHONE_RE = re.compile(r"\+[1-9][0-9]{7,14}")
TWILIO_SID_RE = re.compile(r"\b(?:AC|SK|CA|PN|MG)[a-fA-F0-9]{32}\b")
CLOSED_BOOLEAN_EXPECTATIONS = {
    "VERIFY_TWILIO_SIGNATURES": True,
    "ENABLE_REALTIME_VOICE": False,
    "ENABLE_PUBLIC_PROVIDER_INGRESS": False,
    "ENABLE_CONTRACTOR_PORTAL": False,
    "ENABLE_LIVE_EMAIL": False,
    "ENABLE_LIVE_MESSAGING": False,
    "ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE": False,
}
CLOSED_APPLY_FLAGS = {
    "ENABLE_REALTIME_VOICE": "false",
    "ENABLE_PUBLIC_PROVIDER_INGRESS": "false",
}
CREDENTIAL_KEYS = (
    "GEMINI_API_KEY",
    "GOOGLE_API_KEY",
    "OPENAI_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "TWILIO_HUMAN_TRANSFER_NUMBER",
    "APP_SECRET",
    "INTERNAL_API_TOKEN",
    "INTERNAL_API_CLIENT_ID",
    "DATABASE_URL",
)


class RenderInventoryError(RuntimeError):
    pass


def api_key() -> str:
    return os.getenv("RENDER_API_KEY", "").strip()


def api_key_ready() -> bool:
    return bool(api_key())


def _norm(value: object) -> str:
    return str(value or "").strip().casefold()


def is_hlo_resource(name: object) -> bool:
    text = _norm(name)
    return any(marker in text for marker in HLO_NAME_MARKERS)


def is_maintenanceos_resource(name: object) -> bool:
    text = _norm(name)
    return any(marker in text for marker in MOS_NAME_MARKERS) and not is_hlo_resource(text)


def _truthy(value: object) -> bool:
    return _norm(value) in {"1", "true", "yes", "on"}


def _flag_matches(actual: object, expected: bool) -> bool:
    if actual is None or str(actual).strip() == "":
        return False
    return _truthy(actual) is expected


def database_scheme(url: object) -> str:
    raw = str(url or "").strip().lower()
    if not raw:
        return "absent"
    if raw.startswith(("postgresql://", "postgresql+psycopg://")):
        return "postgresql"
    if raw.startswith("sqlite:"):
        return "sqlite"
    return "other"


def public_base_url_ready(value: object) -> bool:
    try:
        parsed = urlsplit(str(value or "").strip())
    except ValueError:
        return False
    host = (parsed.hostname or "").casefold()
    return bool(
        parsed.scheme == "https"
        and host
        and host not in {"localhost", "127.0.0.1", "::1"}
        and "your-public-domain" not in host
        and not parsed.username
        and not parsed.password
        and not parsed.query
        and not parsed.fragment
        and parsed.path in {"", "/"}
    )


def redact_env(env: dict[str, str]) -> dict[str, Any]:
    """Return names, presence, and non-secret flag booleans. Never copy values."""
    keys = sorted(env)
    flags = {}
    for key, expected in CLOSED_BOOLEAN_EXPECTATIONS.items():
        flags[key] = {
            "present": key in env,
            "matches_closed": _flag_matches(env.get(key), expected),
            "expected": expected,
        }
    credentials = {key: bool(str(env.get(key, "")).strip()) for key in CREDENTIAL_KEYS}
    phone = str(env.get("TWILIO_PHONE_NUMBER", "")).strip()
    transfer = str(env.get("TWILIO_HUMAN_TRANSFER_NUMBER", "")).strip()
    return {
        "key_count": len(keys),
        "keys": keys,
        "closed_flags": flags,
        "credentials_present": credentials,
        "voice_provider_is_gemini": _norm(env.get("VOICE_PROVIDER")) == "gemini",
        "twilio_signatures_enabled": _truthy(env.get("VERIFY_TWILIO_SIGNATURES")),
        "realtime_voice_enabled": _truthy(env.get("ENABLE_REALTIME_VOICE")),
        "public_provider_ingress_enabled": _truthy(env.get("ENABLE_PUBLIC_PROVIDER_INGRESS")),
        "auto_dispatch_disabled": str(env.get("DEFAULT_AUTO_DISPATCH_LIMIT", "")).strip() == "0",
        "test_number_confirmed": _truthy(env.get("TWILIO_TEST_NUMBER_CONFIRMED")),
        "dedicated_test_number_distinct": bool(phone and transfer and phone != transfer),
        "public_https_url_ready": public_base_url_ready(env.get("PUBLIC_BASE_URL")),
        "public_base_url_matches_render_service": str(env.get("PUBLIC_BASE_URL", "")).strip().rstrip("/")
        == EXPECTED_PUBLIC_BASE_URL,
        "database_scheme": database_scheme(env.get("DATABASE_URL")),
        "database_tls_required": _truthy(env.get("DATABASE_TLS_REQUIRED")) if "DATABASE_TLS_REQUIRED" in env else False,
        "database_deployment_mode_managed_test": _norm(env.get("DATABASE_DEPLOYMENT_MODE")) == "managed_test",
        "rate_limits_configured": _rate_ok(env.get("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE"))
        and _rate_ok(env.get("PUBLIC_WS_RATE_LIMIT_PER_MINUTE")),
    }


def _rate_ok(value: object) -> bool:
    try:
        return 1 <= int(str(value).strip()) <= 10_000
    except (TypeError, ValueError):
        return False


def closed_pre_call_ready(redacted: dict[str, Any]) -> bool:
    flags = redacted.get("closed_flags") or {}
    return all(item.get("matches_closed") for item in flags.values()) and bool(
        redacted.get("voice_provider_is_gemini")
        and redacted.get("auto_dispatch_disabled")
        and redacted.get("public_https_url_ready")
        and not redacted.get("realtime_voice_enabled")
        and not redacted.get("public_provider_ingress_enabled")
    )


def summarize_service(service: dict[str, Any]) -> dict[str, Any]:
    details = service.get("serviceDetails") or {}
    return {
        "id": service.get("id"),
        "name": service.get("name"),
        "type": service.get("type"),
        "owner_id": service.get("ownerId"),
        "repo": service.get("repo"),
        "branch": service.get("branch"),
        "auto_deploy": service.get("autoDeploy"),
        "auto_deploy_off": _norm(service.get("autoDeploy")) in {"no", "false", "0"},
        "suspended": service.get("suspended"),
        "url": details.get("url") or details.get("externalUrl"),
        "region": details.get("region"),
        "hlo": is_hlo_resource(service.get("name")),
        "maintenanceos": is_maintenanceos_resource(service.get("name")),
    }


def summarize_postgres(instance: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": instance.get("id"),
        "name": instance.get("name"),
        "status": instance.get("status"),
        "plan": instance.get("plan"),
        "region": instance.get("region"),
        "version": instance.get("version"),
        "suspended": instance.get("suspended"),
        "high_availability": bool(instance.get("highAvailabilityEnabled")),
        "hlo": is_hlo_resource(instance.get("name")),
        "maintenanceos": is_maintenanceos_resource(instance.get("name")),
    }


def summarize_deploy(deploy: dict[str, Any]) -> dict[str, Any]:
    commit = deploy.get("commit") or {}
    return {
        "id": deploy.get("id"),
        "status": deploy.get("status"),
        "trigger": deploy.get("trigger"),
        "commit_id": commit.get("id"),
        "created_at": deploy.get("createdAt"),
        "finished_at": deploy.get("finishedAt"),
    }


def forbidden_substrings(env: dict[str, str], key: str) -> list[str]:
    forbidden = [key] if key else []
    for env_key in CREDENTIAL_KEYS:
        value = str(env.get(env_key, "")).strip()
        if len(value) >= 4:
            forbidden.append(value)
    return forbidden


def payload_leaks(payload: object, forbidden: list[str]) -> list[str]:
    blob = json.dumps(payload, sort_keys=True)
    leaks = []
    for item in forbidden:
        if item and item in blob:
            leaks.append("secret_value")
            break
    if PHONE_RE.search(blob):
        leaks.append("phone_number")
    if TWILIO_SID_RE.search(blob):
        leaks.append("twilio_sid")
    if "Bearer " in blob:
        leaks.append("authorization_header")
    return leaks


def _unwrap(items: list[Any], inner_keys: tuple[str, ...]) -> list[Any]:
    out = []
    for item in items:
        if not isinstance(item, dict):
            continue
        extracted = None
        for key in inner_keys:
            if key in item and isinstance(item[key], dict):
                extracted = item[key]
                break
        out.append(extracted if extracted is not None else item)
    return out


class RenderClient:
    def __init__(self, key: str, transport: httpx.BaseTransport | None = None):
        if not key:
            raise RenderInventoryError("RENDER_API_KEY is missing")
        self._client = httpx.Client(
            base_url=RENDER_API,
            headers={"Authorization": f"Bearer {key}", "Accept": "application/json"},
            timeout=30.0,
            transport=transport,
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "RenderClient":
        return self

    def __exit__(self, *args: object) -> None:
        self.close()

    def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        response = self._client.get(path, params=params)
        if response.status_code == 401:
            raise RenderInventoryError("RENDER_API_KEY was rejected")
        if response.status_code == 404:
            return None
        response.raise_for_status()
        return response.json()

    def paginate(self, path: str, inner_keys: tuple[str, ...], extra: dict[str, Any] | None = None) -> list[Any]:
        items: list[Any] = []
        cursor = None
        while True:
            params = {"limit": 100, **(extra or {})}
            if cursor:
                params["cursor"] = cursor
            payload = self._get(path, params=params) or []
            if not isinstance(payload, list):
                raise RenderInventoryError(f"unexpected list payload from {path}")
            items.extend(_unwrap(payload, inner_keys))
            if len(payload) < 100:
                break
            last = payload[-1] if payload else {}
            cursor = last.get("cursor") if isinstance(last, dict) else None
            if not cursor:
                break
        return items

    def workspaces(self) -> list[dict[str, Any]]:
        return self.paginate("/v1/owners", ("owner",))

    def services(self) -> list[dict[str, Any]]:
        return self.paginate("/v1/services", ("service",))

    def postgres(self) -> list[dict[str, Any]]:
        return self.paginate("/v1/postgres", ("postgres",))

    def service(self, service_id: str) -> dict[str, Any] | None:
        payload = self._get(f"/v1/services/{service_id}")
        if payload is None:
            return None
        if isinstance(payload, dict) and "service" in payload and isinstance(payload["service"], dict):
            return payload["service"]
        return payload if isinstance(payload, dict) else None

    def env_vars(self, service_id: str) -> dict[str, str]:
        rows = self.paginate(f"/v1/services/{service_id}/env-vars", ("envVar",))
        out: dict[str, str] = {}
        for row in rows:
            key = str(row.get("key") or "").strip()
            if key:
                out[key] = str(row.get("value") or "")
        return out

    def deploys(self, service_id: str, limit: int = 5) -> list[dict[str, Any]]:
        payload = self._get(f"/v1/services/{service_id}/deploys", params={"limit": limit}) or []
        if not isinstance(payload, list):
            return []
        return _unwrap(payload, ("deploy",))[:limit]

    def put_env_var(self, service_id: str, key: str, value: str) -> None:
        response = self._client.put(
            f"/v1/services/{service_id}/env-vars/{key}",
            json={"value": value},
        )
        response.raise_for_status()

    def trigger_deploy(self, service_id: str) -> dict[str, Any]:
        response = self._client.post(
            f"/v1/services/{service_id}/deploys",
            json={"clearCache": "do_not_clear"},
        )
        if response.status_code not in {200, 201, 202}:
            response.raise_for_status()
        payload = response.json() if response.content else {}
        if isinstance(payload, dict) and "deploy" in payload and isinstance(payload["deploy"], dict):
            return payload["deploy"]
        return payload if isinstance(payload, dict) else {"status": response.status_code}


def probe_public_health(getter: Callable[[str], httpx.Response] | None = None) -> dict[str, Any]:
    fetch = getter or (lambda url: httpx.get(url, timeout=90.0))
    try:
        response = fetch(PUBLIC_HEALTH_URL)
    except httpx.HTTPError as exc:
        return {"reachable": False, "error": exc.__class__.__name__, "realtime_voice": None, "ok": False}
    body: dict[str, Any] = {}
    try:
        parsed = response.json()
        if isinstance(parsed, dict):
            body = parsed
    except ValueError:
        body = {}
    return {
        "reachable": response.status_code == 200,
        "http_status": response.status_code,
        "ok": bool(body.get("ok")),
        "version_is_v1_pilot": body.get("version") == "v1-pilot",
        "realtime_voice": bool(body["realtime_voice"]) if "realtime_voice" in body else None,
    }


def resolve_target(services: list[dict[str, Any]]) -> dict[str, Any]:
    by_name = [item for item in services if _norm(item.get("name")) == TARGET_SERVICE_NAME]
    if by_name:
        return by_name[0]
    for service_id in OWNER_SERVICE_IDS:
        match = next((item for item in services if item.get("id") == service_id), None)
        if match:
            return match
    raise RenderInventoryError(f"MaintenanceOS Render service {TARGET_SERVICE_NAME} was not found")


def inventory(client: RenderClient, *, health: dict[str, Any] | None = None) -> dict[str, Any]:
    workspaces = [
        {"id": item.get("id"), "name": item.get("name"), "type": item.get("type")}
        for item in client.workspaces()
    ]
    all_services = client.services()
    skipped_hlo = [summarize_service(item) for item in all_services if is_hlo_resource(item.get("name"))]
    mos_services = [summarize_service(item) for item in all_services if is_maintenanceos_resource(item.get("name"))]
    target_raw = resolve_target(all_services)
    if is_hlo_resource(target_raw.get("name")):
        raise RenderInventoryError("refusing to inventory an HLO-named Render service")
    target = summarize_service(target_raw)
    env = client.env_vars(target_raw["id"])
    redacted = redact_env(env)
    deploys = [summarize_deploy(item) for item in client.deploys(target_raw["id"])]
    postgres = [summarize_postgres(item) for item in client.postgres()]
    live = health if health is not None else probe_public_health()
    report = {
        "profile": "render-controlled-call-inventory",
        "api_key_ready": True,
        "hlo_untouched": True,
        "workspaces": workspaces,
        "owner_workspace_seen": any(item.get("id") in OWNER_WORKSPACE_IDS for item in workspaces),
        "maintenanceos_services": mos_services,
        "skipped_hlo_services": [{"id": item["id"], "name": item["name"]} for item in skipped_hlo],
        "target": target,
        "target_is_owner_id": target.get("id") in OWNER_SERVICE_IDS,
        "latest_deploys": deploys,
        "env": redacted,
        "closed_pre_call_ready": closed_pre_call_ready(redacted),
        "postgres": postgres,
        "maintenanceos_postgres_present": any(item.get("maintenanceos") for item in postgres),
        "public_health": live,
        "canonical_repo_deployed": "maintenanceos-v1-pilot" in _norm(target.get("repo")),
        "legacy_cloud_workers_deployed": "cloud-workers" in _norm(target.get("repo")),
        "ready_for_controlled_test_call": False,
    }
    leaks = payload_leaks(report, forbidden_substrings(env, api_key()))
    if leaks:
        raise RenderInventoryError("inventory output failed redaction")
    report["redaction_passed"] = True
    return report


def apply_closed_flags(client: RenderClient, service: dict[str, Any]) -> dict[str, Any]:
    service_id = str(service.get("id") or "")
    name = service.get("name")
    if not service_id or is_hlo_resource(name) or not is_maintenanceos_resource(name):
        raise RenderInventoryError("refusing closed-flag apply on a non-MaintenanceOS or HLO target")
    if _norm(name) != TARGET_SERVICE_NAME and service_id not in OWNER_SERVICE_IDS:
        raise RenderInventoryError("refusing closed-flag apply on an unexpected Render service")
    changed = []
    for key, value in CLOSED_APPLY_FLAGS.items():
        client.put_env_var(service_id, key, value)
        changed.append(key)
    deploy = client.trigger_deploy(service_id)
    return {"keys_set_false": changed, "deploy": summarize_deploy(deploy)}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Boolean-only MaintenanceOS Render inventory")
    parser.add_argument(
        "--apply-closed-flags",
        action="store_true",
        help="Set realtime/ingress false on the MaintenanceOS Render service and redeploy. Never touches HLO.",
    )
    args = parser.parse_args(argv)
    if not api_key_ready():
        payload = {
            "profile": "render-controlled-call-inventory",
            "api_key_ready": False,
            "hlo_untouched": True,
            "ready_for_controlled_test_call": False,
            "error": "RENDER_API_KEY is not present in this environment",
            "public_health": probe_public_health(),
        }
        print(json.dumps(payload, indent=2, sort_keys=True))
        return 2
    try:
        with RenderClient(api_key()) as client:
            report = inventory(client)
            if args.apply_closed_flags:
                applied = apply_closed_flags(client, report["target"])
                report = inventory(client, health=report.get("public_health"))
                report["closed_flag_apply"] = applied
        print(json.dumps(report, indent=2, sort_keys=True))
        return 0 if report.get("closed_pre_call_ready") else 1
    except RenderInventoryError as exc:
        print(json.dumps({
            "profile": "render-controlled-call-inventory",
            "api_key_ready": True,
            "hlo_untouched": True,
            "ready_for_controlled_test_call": False,
            "error": str(exc),
        }, indent=2, sort_keys=True))
        return 1


if __name__ == "__main__":
    sys.exit(main())
