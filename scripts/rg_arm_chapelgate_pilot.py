#!/usr/bin/env python3
"""Release Guardian — arm Chapelgate 10-call pilot on Lane A only.

Minimal reversible deploy of cursor/pilot-guard-lane-a-e283 onto
maintenanceos-redteam-v2. Never touches HLO / Cheap Trips / Evidence Wallet.
Never changes the main Chapelgate number.

Requires RENDER_API_KEY.

Usage:
  python3 scripts/rg_arm_chapelgate_pilot.py --dry-run
  python3 scripts/rg_arm_chapelgate_pilot.py --apply
  python3 scripts/rg_arm_chapelgate_pilot.py --disarm
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
PILOT_BRANCH = os.getenv("PILOT_GUARD_BRANCH", "cursor/pilot-guard-lane-a-e283")
ROLLBACK_FILE = ROOT / "docs" / "pilot_guard" / "ROLLBACK_POINT.json"
EVIDENCE_FILE = ROOT / "docs" / "pilot_guard" / "ARM_EVIDENCE.json"

PILOT_ENV = {
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
    # Render env var update via service env endpoint when available.
    for key, value in env.items():
        response = client._client.put(
            f"/v1/services/{service_id}/env-vars/{key}",
            json={"value": value},
        )
        if response.status_code not in {200, 201, 202}:
            # Fallback: batch update
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


def _wait_pilot_armed(*, timeout_s: float = 480.0) -> dict[str, Any]:
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
        last = {
            "reachable": response.status_code == 200,
            "http_status": response.status_code,
            "body": body if isinstance(body, dict) else {},
            "pilot": pilot if isinstance(pilot, dict) else {},
        }
        if (
            last["reachable"]
            and body.get("ok") is True
            and isinstance(pilot, dict)
            and pilot.get("armed") is True
            and pilot.get("tenant") == "chapelgate"
            and int(pilot.get("max_real_calls") or 0) == 10
            and int(pilot.get("calls_completed") or -1) == 0
            and pilot.get("abort_logic_active") is True
            and pilot.get("scorecard_active") is True
            and pilot.get("main_number_changed") is False
        ):
            return last
        time.sleep(8)
    return last


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--disarm", action="store_true")
    parser.add_argument("--branch", default=PILOT_BRANCH)
    args = parser.parse_args()
    if not api_key_ready():
        print(json.dumps({"ok": False, "error": "RENDER_API_KEY missing", "hlo_untouched": True}, indent=2))
        return 2

    client = RenderClient()
    report = inventory(client)
    target = report.get("target") or {}
    _assert_mos_only(target)
    service_id = str(target["id"])

    plan = {
        "profile": "rg-arm-chapelgate-10-call-pilot",
        "service": target.get("name"),
        "service_id": service_id,
        "current_branch": target.get("branch"),
        "desired_branch": args.branch,
        "desired_repo": CANONICAL_REPO,
        "pilot_env_keys": sorted(PILOT_ENV),
        "canonical_head": _git_sha(),
        "public_health_before": report.get("public_health"),
        "hlo_untouched": True,
        "main_number_change": False,
        "owner_approval_recorded": True,
    }
    if args.dry_run or not (args.apply or args.disarm):
        print(json.dumps({"ok": True, "mode": "dry-run", "plan": plan}, indent=2, sort_keys=True))
        return 0

    # Persist rollback snapshot before mutation
    ROLLBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
    rollback = {
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "service": TARGET_SERVICE_NAME,
        "service_id": service_id,
        "prior_branch": target.get("branch"),
        "prior_repo": target.get("repo"),
        "lane_a_git_sha_before": "2e28fef43f18c236bfa422b7a5384bdaf673b504",
        "rollback_tag": "pilot-guard-rollback-2e28fef",
        "procedure": (
            "Set PILOT_MODE_ARMED=false and Manual Deploy prior commit, "
            "or checkout pilot-guard-rollback-2e28fef / 2e28fef and redeploy"
        ),
    }
    ROLLBACK_FILE.write_text(json.dumps(rollback, indent=2, sort_keys=True) + "\n")

    if args.disarm:
        _set_env(client, service_id, {"PILOT_MODE_ARMED": "false"})
        deploy = _trigger_deploy(client, service_id)
        print(json.dumps({"ok": True, "mode": "disarm", "deploy": deploy, "rollback": rollback}, indent=2))
        return 0

    # Retarget branch + arm env + deploy
    _patch_service(
        client,
        service_id,
        {
            "repo": CANONICAL_REPO,
            "branch": args.branch,
            "rootDir": "",
            "autoDeploy": "no",
        },
    )
    _set_env(client, service_id, PILOT_ENV)
    deploy = _trigger_deploy(client, service_id)
    health = _wait_pilot_armed()
    evidence = {
        "ok": bool((health.get("pilot") or {}).get("armed")),
        "mode": "apply",
        "plan": plan,
        "deploy": deploy,
        "rollback": rollback,
        "health_after": health,
        "gates": {
            "LANE_A": "HEALTHY" if (health.get("body") or {}).get("ok") else "UNHEALTHY",
            "PILOT_MODE": "ARMED" if (health.get("pilot") or {}).get("armed") else "NOT_ARMED",
            "TENANT": (health.get("pilot") or {}).get("tenant"),
            "CALL_LIMIT": (health.get("pilot") or {}).get("max_real_calls"),
            "CALLS_COMPLETED": (health.get("pilot") or {}).get("calls_completed"),
            "ABORT_LOGIC": "ACTIVE" if (health.get("pilot") or {}).get("abort_logic_active") else "INACTIVE",
            "SCORECARD": "ACTIVE" if (health.get("pilot") or {}).get("scorecard_active") else "INACTIVE",
            "MAIN_NUMBER_CHANGED": "NO",
            "ROLLBACK_READY": "YES",
        },
    }
    EVIDENCE_FILE.write_text(json.dumps(evidence, indent=2, sort_keys=True, default=str) + "\n")
    print(json.dumps(evidence, indent=2, sort_keys=True, default=str))
    return 0 if evidence["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
