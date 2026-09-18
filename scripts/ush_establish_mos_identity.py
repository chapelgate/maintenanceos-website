#!/usr/bin/env python3
"""Establish MaintenanceOS workload identity with live USH control plane.

Uses USH_BOOTSTRAP_TOKEN (admin) when present to:
  1) register principal maintenanceos-v1-pilot
  2) add least-privilege policy rules (maintenanceos project only)
  3) persist USH_WORKLOAD_TOKEN to MOS secrets store (mode 600)
Never prints token values. Never writes tokens to git.
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

SECRETS_DIR = Path(os.getenv("MOS_SECRETS_DIR", "/tmp/mos-secrets"))
PRINCIPAL_ID = ush_client.MOS_PRINCIPAL_ID
PROJECT = ush_client.MOS_PROJECT
ENVIRONMENT = ush_client.MOS_ENVIRONMENT
TENANT = ush_client.MOS_TENANT


def _redact_token(value: str) -> dict:
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
    path = Path(os.getenv("USH_BOOTSTRAP_TOKEN_FILE") or "/tmp/mos-secrets/USH_BOOTSTRAP_TOKEN")
    if path.is_file():
        return path.read_text(encoding="utf-8").strip()
    return ""


def _call(method: str, path: str, payload: dict | None = None, *, headers: dict | None = None) -> tuple[int, dict]:
    h = {"Accept": "application/json", "User-Agent": "mos-ush-bootstrap/1", **(headers or {})}
    body = None
    if payload is not None:
        body = json.dumps(payload).encode()
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(f"{ush_client.ush_base_url()}{path}", data=body, headers=h, method=method)
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


def _extract_token(body: dict) -> str:
    if not isinstance(body, dict):
        return ""
    for key in ("token", "access_token", "workload_token", "principal_token", "jwt"):
        val = body.get(key)
        if isinstance(val, str) and val.strip():
            return val.strip()
    principal = body.get("principal")
    if isinstance(principal, dict):
        for key in ("token", "access_token", "workload_token"):
            val = principal.get(key)
            if isinstance(val, str) and val.strip():
                return val.strip()
    return ""


def _write_secret(name: str, value: str) -> None:
    SECRETS_DIR.mkdir(mode=0o700, parents=True, exist_ok=True)
    path = SECRETS_DIR / name
    path.write_text(value, encoding="utf-8")
    os.chmod(path, 0o600)
    os.environ[name] = value


def _policy_rules(auth_header: str) -> list[dict]:
    """Minimum grants: MOS principal may use DO/Twilio/Resend for maintenanceos only."""
    rules = []
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
        rules.append(
            {
                "effect": "allow",
                "principal_id": PRINCIPAL_ID,
                "tenant": TENANT,
                "project": PROJECT,
                "environment": ENVIRONMENT,
                "provider": provider,
                "capability": capability,
            }
        )
    # Explicit deny for foreign project deploy
    rules.append(
        {
            "effect": "deny",
            "principal_id": PRINCIPAL_ID,
            "tenant": TENANT,
            "project": "holiday-let-operator",
            "provider": "digitalocean",
            "capability": "apps.deploy",
        }
    )
    applied = []
    for rule in rules:
        code, body = _call(
            "POST",
            "/v1/admin/policy/rules",
            rule,
            headers={"Authorization": auth_header, "x-ush-bootstrap-token": _bootstrap_token()},
        )
        applied.append({"capability": rule.get("capability"), "provider": rule.get("provider"), "http": code, "ok": code < 400})
    return applied


def main() -> int:
    report: dict = {
        "ok": False,
        "ush_health": ush_client.health(),
        "bootstrap_token": _redact_token(_bootstrap_token()),
        "existing_workload": _redact_token((os.getenv("USH_WORKLOAD_TOKEN") or "").strip()),
        "register": None,
        "policy": None,
        "workload_persisted": False,
        "validation": None,
        "error": None,
    }

    # If workload already present, validate and exit success
    existing = (os.getenv("USH_WORKLOAD_TOKEN") or "").strip()
    if not existing and (SECRETS_DIR / "USH_WORKLOAD_TOKEN").is_file():
        existing = (SECRETS_DIR / "USH_WORKLOAD_TOKEN").read_text(encoding="utf-8").strip()
        if existing:
            os.environ["USH_WORKLOAD_TOKEN"] = existing
    if existing:
        report["validation"] = {
            "release_gates": ush_client.release_gates()["gates"],
            "isolation": ush_client.assert_project_isolation(),
        }
        try:
            caps = ush_client.list_capabilities()
            report["validation"]["capabilities_ok"] = True
            report["validation"]["capabilities_keys"] = sorted(caps.keys())[:20]
        except ush_client.UshError as exc:
            report["validation"]["capabilities_ok"] = False
            report["validation"]["error"] = f"{exc.code}:{exc.detail}"
        report["ok"] = bool(report["validation"]["release_gates"].get("workload_identity_present"))
        print(json.dumps(report, indent=2))
        return 0 if report["ok"] else 2

    boot = _bootstrap_token()
    if not boot:
        report["error"] = "USH_BOOTSTRAP_OR_WORKLOAD_TOKEN_REQUIRED"
        print(json.dumps(report, indent=2))
        return 4

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
        },
        headers={"x-ush-bootstrap-token": boot},
    )
    token = _extract_token(body if isinstance(body, dict) else {})
    report["register"] = {
        "http": code,
        "token": _redact_token(token),
        "detail": (body.get("detail") if isinstance(body, dict) else None),
        "keys": sorted(body.keys()) if isinstance(body, dict) else [],
    }
    if code >= 400 or not token:
        # Maybe principal exists — try auth/workload exchange with bootstrap as admin to mint
        code2, body2 = _call(
            "POST",
            "/v1/auth/workload",
            {
                "principal_id": PRINCIPAL_ID,
                "project": PROJECT,
                "environment": ENVIRONMENT,
                "tenant": TENANT,
                "workload_token": boot,
            },
            headers={"Authorization": f"Bearer {boot}", "x-ush-bootstrap-token": boot},
        )
        token = _extract_token(body2 if isinstance(body2, dict) else {}) or token
        report["register"]["workload_exchange_http"] = code2
        report["register"]["workload_exchange_token"] = _redact_token(token)
        report["register"]["workload_exchange_keys"] = sorted(body2.keys()) if isinstance(body2, dict) else []
        if not token:
            report["error"] = "PRINCIPAL_REGISTER_OR_EXCHANGE_FAILED"
            print(json.dumps(report, indent=2))
            return 5

    _write_secret("USH_WORKLOAD_TOKEN", token)
    report["workload_persisted"] = True
    report["workload"] = _redact_token(token)
    auth = f"Bearer {token}"
    report["policy"] = _policy_rules(auth)

    # Validate without printing secrets
    report["validation"] = {
        "release_gates": ush_client.release_gates()["gates"],
        "isolation": ush_client.assert_project_isolation(),
    }
    try:
        ush_client.request_credential("digitalocean", "health")
        report["validation"]["digitalocean_health_cred"] = True
    except ush_client.UshError as exc:
        report["validation"]["digitalocean_health_cred"] = False
        report["validation"]["digitalocean_health_error"] = f"{exc.code}:{exc.detail}"

    report["ok"] = bool(report["validation"]["release_gates"].get("workload_identity_present"))
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 6


if __name__ == "__main__":
    raise SystemExit(main())
