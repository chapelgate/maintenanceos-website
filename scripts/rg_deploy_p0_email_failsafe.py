#!/usr/bin/env python3
"""Deploy P0 email fail-safe + raise pilot bootstrap floor to 3 on Lane A only.

Requires RENDER_API_KEY. Never touches HLO / Cheap Trips / Evidence Wallet.
Never changes the main Chapelgate number. Does not disarm the pilot.

Usage:
  python3 scripts/rg_deploy_p0_email_failsafe.py --dry-run
  python3 scripts/rg_deploy_p0_email_failsafe.py --apply
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from render_inventory import (  # noqa: E402
    PUBLIC_HEALTH_URL,
    TARGET_SERVICE_NAME,
    RenderClient,
    RenderInventoryError,
    api_key_ready,
    inventory,
    is_hlo_resource,
    is_maintenanceos_resource,
)

CANONICAL_REPO = "https://github.com/chapelgate/maintenanceos-v1-pilot"
PILOT_BRANCH = os.getenv("PILOT_GUARD_BRANCH", "cursor/controlled-call-readiness-3402")
EVIDENCE_FILE = ROOT / "docs" / "pilot_guard" / "P0_EMAIL_FAILSAFE_DEPLOY.json"

DEPLOY_ENV = {
    "PILOT_MODE_ARMED": "true",
    "PILOT_OWNER_APPROVED": "true",
    "PILOT_TENANT": "chapelgate",
    "PILOT_MAX_REAL_CALLS": "10",
    "PILOT_BOOTSTRAP_CALLS": "3",
    "GEMINI_SILENCE_DURATION_MS": "350",
}


def _git_sha() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"


def _assert_mos_only(service: dict[str, Any]) -> None:
    name = service.get("name")
    if is_hlo_resource(name):
        raise RenderInventoryError("refusing to deploy to HLO-named service")
    if not is_maintenanceos_resource(name):
        raise RenderInventoryError("refusing to deploy to non-MaintenanceOS service")
    if name != TARGET_SERVICE_NAME:
        raise RenderInventoryError(f"unexpected target service {name!r}")


def _patch_service(client: RenderClient, service_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = client._client.patch(f"/v1/services/{service_id}", json=payload)
    if response.status_code not in {200, 201, 202}:
        raise RenderInventoryError(f"service patch failed HTTP {response.status_code}: {response.text[:300]}")
    body = response.json() if response.content else {}
    if isinstance(body, dict) and isinstance(body.get("service"), dict):
        return body["service"]
    return body if isinstance(body, dict) else {"status": response.status_code}


def _set_env(client: RenderClient, service_id: str, env: dict[str, str]) -> None:
    for key, value in env.items():
        response = client._client.put(
            f"/v1/services/{service_id}/env-vars/{key}",
            json={"value": value},
        )
        if response.status_code not in {200, 201, 202}:
            batch = client._client.put(
                f"/v1/services/{service_id}/env-vars",
                json=[{"key": k, "value": v} for k, v in env.items()],
            )
            if batch.status_code not in {200, 201, 202}:
                raise RenderInventoryError(
                    f"env update failed HTTP {response.status_code}/{batch.status_code}"
                )
            return


def _trigger_deploy(client: RenderClient, service_id: str) -> dict[str, Any]:
    response = client._client.post(
        f"/v1/services/{service_id}/deploys",
        json={"clearCache": "do_not_clear"},
    )
    if response.status_code not in {200, 201, 202}:
        raise RenderInventoryError(f"deploy trigger failed HTTP {response.status_code}: {response.text[:300]}")
    body = response.json() if response.content else {}
    if isinstance(body, dict) and isinstance(body.get("deploy"), dict):
        return body["deploy"]
    return body if isinstance(body, dict) else {"status": response.status_code}


def _wait_email_gate(*, timeout_s: float = 480.0) -> dict[str, Any]:
    deadline = time.time() + timeout_s
    last: dict[str, Any] = {}
    while time.time() < deadline:
        try:
            response = httpx.get(PUBLIC_HEALTH_URL, timeout=90.0)
            body = response.json() if response.content else {}
        except (httpx.HTTPError, ValueError) as exc:
            last = {"reachable": False, "error": exc.__class__.__name__}
            time.sleep(8)
            continue
        pilot = body.get("pilot") if isinstance(body, dict) else {}
        gate = (pilot or {}).get("email_gate") if isinstance(pilot, dict) else None
        last = {
            "reachable": response.status_code == 200,
            "http_status": response.status_code,
            "calls_completed": (pilot or {}).get("calls_completed") if isinstance(pilot, dict) else None,
            "email_gate": gate,
            "persistence": (pilot or {}).get("persistence") if isinstance(pilot, dict) else None,
        }
        if last["reachable"] and isinstance(gate, dict) and gate.get("pilot_resend_ready") is not None:
            return last
        time.sleep(8)
    return last


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    if not args.dry_run and not args.apply:
        parser.error("specify --dry-run or --apply")

    plan = {
        "service": TARGET_SERVICE_NAME,
        "branch": PILOT_BRANCH,
        "repo": CANONICAL_REPO,
        "sha": _git_sha(),
        "env": {k: ("<set>" if v else "<empty>") for k, v in DEPLOY_ENV.items()},
        "api_key_ready": api_key_ready(),
    }
    if args.dry_run:
        print(json.dumps({"ok": True, "mode": "dry-run", "plan": plan}, indent=2))
        return 0

    if not api_key_ready():
        print(json.dumps({"ok": False, "error": "RENDER_API_KEY missing", "hlo_untouched": True}, indent=2))
        return 2

    client = RenderClient()
    inv = inventory(client)
    service = inv["target"]
    _assert_mos_only(service)
    service_id = service["id"]

    _patch_service(
        client,
        service_id,
        {
            "repo": CANONICAL_REPO,
            "branch": PILOT_BRANCH,
            "autoDeploy": "no",
        },
    )
    _set_env(client, service_id, DEPLOY_ENV)
    deploy = _trigger_deploy(client, service_id)
    health = _wait_email_gate()
    evidence = {
        "ok": bool(health.get("email_gate")),
        "mode": "apply",
        "deploy": {"id": deploy.get("id"), "status": deploy.get("status")},
        "sha": _git_sha(),
        "health": health,
        "hlo_untouched": True,
        "main_number_changed": False,
    }
    EVIDENCE_FILE.parent.mkdir(parents=True, exist_ok=True)
    EVIDENCE_FILE.write_text(json.dumps(evidence, indent=2) + "\n")
    print(json.dumps(evidence, indent=2))
    return 0 if evidence["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
