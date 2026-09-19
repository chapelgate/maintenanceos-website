#!/usr/bin/env python3
"""Bootstrap renewable MaintenanceOS → USH workload identity (one-time admin).

Does NOT persist USH issue_token() bearers (default TTL 3600s) as USH_WORKLOAD_TOKEN.

Instead:
  1) Generate durable Ed25519 workload keypair (survives restart/redeploy)
  2) Register principal + public key with USH using admin bootstrap (one-time)
  3) Apply least-privilege policy for maintenanceos project only
  4) Exchange signed assertion → ephemeral bearer cache (auto-refreshed later)

Never prints secret material. Never writes tokens to git.
STOP: do not ask Andy for bootstrap until identity lifecycle tests prove renewal.
"""

from __future__ import annotations

import hashlib
import json
import os
import ssl
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import ush_client  # noqa: E402
import ush_identity  # noqa: E402

SECRETS_DIR = Path(os.getenv("MOS_SECRETS_DIR", "/tmp/mos-secrets"))
IDENTITY_DIR = ush_identity.identity_dir(SECRETS_DIR)
PRINCIPAL_ID = ush_identity.MOS_PRINCIPAL_ID
PROJECT = ush_identity.MOS_PROJECT
ENVIRONMENT = ush_identity.MOS_ENVIRONMENT
TENANT = ush_identity.MOS_TENANT


def _redact(value: str) -> dict:
    return {
        "present": bool(value),
        "len": len(value or ""),
        "sha16": hashlib.sha256(value.encode()).hexdigest()[:16] if value else None,
    }


def _tls() -> ssl.SSLContext:
    verify = (os.getenv("USH_TLS_VERIFY") or "").strip().lower() in {"1", "true", "yes", "on"}
    return ssl.create_default_context() if verify else ssl._create_unverified_context()


def _bootstrap_token() -> str:
    tok = (os.getenv("USH_BOOTSTRAP_TOKEN") or "").strip()
    if tok:
        return tok
    path = Path(os.getenv("USH_BOOTSTRAP_TOKEN_FILE") or str(SECRETS_DIR / "USH_BOOTSTRAP_TOKEN"))
    if path.is_file():
        return path.read_text(encoding="utf-8").strip()
    return ""


def _call(method: str, path: str, payload: dict | None = None, *, headers: dict | None = None) -> tuple[int, dict]:
    h = {"Accept": "application/json", "User-Agent": "mos-ush-identity-bootstrap/2", **(headers or {})}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(f"{ush_identity.ush_base_url()}{path}", data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=45, context=_tls()) as resp:
            raw = resp.read().decode() or "{}"
            return resp.status, json.loads(raw) if raw.startswith("{") or raw.startswith("[") else {"data": raw}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode() or ""
        try:
            parsed = json.loads(raw) if raw else {}
        except Exception:
            parsed = {"detail": raw[:200]}
        return exc.code, parsed if isinstance(parsed, dict) else {"detail": str(parsed)}


def _forbid_legacy_permanent_bearer() -> None:
    legacy = SECRETS_DIR / "USH_WORKLOAD_TOKEN"
    if legacy.is_file():
        # Remove mistaken permanent bearer persistence from earlier architecture.
        legacy.unlink()
    if (os.getenv("USH_WORKLOAD_TOKEN") or "").strip() and not (
        (os.getenv("USH_ALLOW_LEGACY_BEARER") or "").strip().lower() in {"1", "true", "yes", "on"}
    ):
        # Do not keep promoting env as durable — unset for this process.
        os.environ.pop("USH_WORKLOAD_TOKEN", None)


def _policy_rules(auth_header: str, bootstrap: str) -> list[dict]:
    applied = []
    for provider, capability in (
        ("digitalocean", "apps.list"),
        ("digitalocean", "apps.get"),
        ("digitalocean", "apps.create"),
        ("digitalocean", "apps.update"),
        ("digitalocean", "discover"),
        ("digitalocean", "health"),
        ("digitalocean", "validate"),
        ("twilio", "voice.credentials"),
        ("twilio", "health"),
        ("resend", "email.send"),
        ("openai", "health"),
    ):
        rule = {
            "effect": "allow",
            "principal_id": PRINCIPAL_ID,
            "tenant": TENANT,
            "project": PROJECT,
            "environment": ENVIRONMENT,
            "provider": provider,
            "capability": capability,
        }
        code, _ = _call(
            "POST",
            "/v1/admin/policy/rules",
            rule,
            headers={"Authorization": auth_header, "x-ush-bootstrap-token": bootstrap},
        )
        applied.append({"provider": provider, "capability": capability, "http": code, "ok": code < 400})
    deny = {
        "effect": "deny",
        "principal_id": PRINCIPAL_ID,
        "tenant": TENANT,
        "project": "holiday-let-operator",
        "provider": "digitalocean",
        "capability": "apps.deploy",
    }
    code, _ = _call(
        "POST",
        "/v1/admin/policy/rules",
        deny,
        headers={"Authorization": auth_header, "x-ush-bootstrap-token": bootstrap},
    )
    applied.append({"provider": "digitalocean", "capability": "apps.deploy", "effect": "deny", "http": code, "ok": code < 400})
    return applied


def main() -> int:
    _forbid_legacy_permanent_bearer()
    report: dict = {
        "ok": False,
        "architecture": "renewable_ed25519_workload_identity",
        "legacy_permanent_bearer_forbidden": True,
        "ush_health": ush_client.health(),
        "bootstrap_token": _redact(_bootstrap_token()),
        "identity_dir": str(IDENTITY_DIR),
        "register": None,
        "policy": None,
        "exchange": None,
        "validation": None,
        "error": None,
    }

    existing = ush_identity.load_identity(IDENTITY_DIR)
    if existing is not None:
        # Already bootstrapped — prove renewal works, do not re-ask humans.
        ush_identity.reset_runtime()
        runtime = ush_identity.get_runtime(directory=IDENTITY_DIR)
        try:
            token = runtime.ensure_access_token()
            report["exchange"] = {"ok": True, "bearer": _redact(token), "status": runtime.status()}
            report["validation"] = {"release_gates": ush_client.release_gates()["gates"]}
            report["ok"] = True
            print(json.dumps(report, indent=2))
            return 0
        except ush_identity.UshIdentityError as exc:
            report["error"] = f"{exc.code}:{exc.detail}"
            print(json.dumps(report, indent=2))
            return 3

    boot = _bootstrap_token()
    if not boot:
        # Do NOT request human action from this script while lifecycle is unproven in CI.
        report["error"] = "DURABLE_IDENTITY_ABSENT_AND_NO_BOOTSTRAP"
        report["next"] = (
            "Identity lifecycle must be proven by tests first. "
            "One-time USH admin bootstrap may register the public key later; "
            "never store issue_token() bearers as USH_WORKLOAD_TOKEN."
        )
        print(json.dumps(report, indent=2))
        return 4

    identity = ush_identity.generate_identity()
    ush_identity.save_identity(identity, IDENTITY_DIR)
    report["identity"] = {
        "principal_id": identity.principal_id,
        "key_id": identity.key_id,
        "public_key_sha16": hashlib.sha256(identity.public_key_b64.encode()).hexdigest()[:16],
        "persisted": True,
        "persists_bearer": False,
    }

    code, body = _call(
        "POST",
        "/v1/principals/register",
        {
            "id": PRINCIPAL_ID,
            "kind": "application",
            "tenant": TENANT,
            "project": PROJECT,
            "environment": ENVIRONMENT,
            "admin": False,
            "workload_public_key": identity.public_key_b64,
            "workload_key_id": identity.key_id,
            "workload_alg": "EdDSA",
        },
        headers={"x-ush-bootstrap-token": boot},
    )
    # Registration may return a short-lived token — use only for policy setup, never persist.
    ephemeral = ""
    for key in ("token", "access_token", "workload_token"):
        if isinstance(body.get(key), str) and body[key].strip():
            ephemeral = body[key].strip()
            break
    report["register"] = {
        "http": code,
        "ephemeral_bearer_returned": bool(ephemeral),
        "ephemeral_bearer_persisted": False,
        "keys": sorted(body.keys()) if isinstance(body, dict) else [],
        "detail": body.get("detail") if isinstance(body, dict) else None,
    }
    if code >= 400 and not ephemeral:
        report["error"] = "PRINCIPAL_REGISTER_FAILED"
        print(json.dumps(report, indent=2))
        return 5

    if ephemeral:
        report["policy"] = _policy_rules(f"Bearer {ephemeral}", boot)
        # Explicitly discard ephemeral bearer — do not write USH_WORKLOAD_TOKEN.
        ephemeral = ""

    ush_identity.reset_runtime()
    runtime = ush_identity.get_runtime(directory=IDENTITY_DIR)
    try:
        token = runtime.ensure_access_token()
        report["exchange"] = {"ok": True, "bearer": _redact(token), "status": runtime.status()}
    except ush_identity.UshIdentityError as exc:
        report["error"] = f"{exc.code}:{exc.detail}"
        print(json.dumps(report, indent=2))
        return 6

    # Ensure no legacy permanent bearer file was created
    report["legacy_USH_WORKLOAD_TOKEN_file_absent"] = not (SECRETS_DIR / "USH_WORKLOAD_TOKEN").is_file()
    report["validation"] = {
        "release_gates": ush_client.release_gates()["gates"],
        "identity_status": runtime.status(),
    }
    report["ok"] = bool(report["validation"]["release_gates"].get("durable_workload_identity_present"))
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 7


if __name__ == "__main__":
    raise SystemExit(main())
