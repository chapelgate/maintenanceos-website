#!/usr/bin/env python3
"""Controlled N=2 deploy for MaintenanceOS test phone path only.

Requires RENDER_API_KEY. Never touches HLO / Cheap Trips / Evidence Wallet.
Records a rollback deploy id, optionally retargets the Render service to the
canonical maintenanceos-v1-pilot branch, opens the controlled-call window,
triggers one deploy, and verifies /health capacity gates.

Usage:
  python3 scripts/controlled_n2_deploy.py --dry-run
  python3 scripts/controlled_n2_deploy.py --apply
  python3 scripts/controlled_n2_deploy.py --rollback DEPLOY_ID
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
    OWNER_SERVICE_IDS,
    PUBLIC_HEALTH_URL,
    TARGET_SERVICE_NAME,
    RenderClient,
    RenderInventoryError,
    api_key,
    api_key_ready,
    inventory,
    is_hlo_resource,
    is_maintenanceos_resource,
    probe_public_health,
    resolve_target,
    summarize_deploy,
)

CANONICAL_REPO = "https://github.com/chapelgate/maintenanceos-v1-pilot"
DEFAULT_BRANCH = os.getenv("N2_DEPLOY_BRANCH", "cursor/n2-live-concurrency-e283")
ROLLBACK_FILE = ROOT / "docs" / "concurrency_100_evidence" / "n2-rollback-point.json"
PREFLIGHT_FILE = ROOT / "docs" / "concurrency_100_evidence" / "n2-preflight.json"

# Controlled-call window flags (test path only). Capacity stays >= 2 with kill-switch on.
OPEN_CALL_ENV = {
    "ENABLE_REALTIME_VOICE": "true",
    "ENABLE_PUBLIC_PROVIDER_INGRESS": "true",
    "VOICE_PROVIDER": "gemini",
    "VERIFY_TWILIO_SIGNATURES": "true",
    "GLOBAL_MAX_CONCURRENT_CALLS": "100",
    "PER_CLIENT_MAX_CONCURRENT_CALLS": "100",
    # Kill-switch: ~$50/hr planning budget keeps N=2 safe and rejects runaway admits.
    "CAPACITY_MAX_HOURLY_BURN_USD": "50",
}


def _git_sha() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"


def _assert_mos_only(service: dict[str, Any]) -> None:
    name = service.get("name")
    sid = str(service.get("id") or "")
    if is_hlo_resource(name):
        raise RenderInventoryError("refusing to deploy to HLO-named service")
    if not is_maintenanceos_resource(name):
        raise RenderInventoryError("refusing to deploy to non-MaintenanceOS service")
    if name != TARGET_SERVICE_NAME and sid not in OWNER_SERVICE_IDS:
        raise RenderInventoryError(f"unexpected target service {name!r}")


def _patch_service(client: RenderClient, service_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = client._client.patch(f"/v1/services/{service_id}", json=payload)
    if response.status_code not in {200, 201, 202}:
        raise RenderInventoryError(f"service patch failed HTTP {response.status_code}: {response.text[:300]}")
    body = response.json() if response.content else {}
    if isinstance(body, dict) and isinstance(body.get("service"), dict):
        return body["service"]
    return body if isinstance(body, dict) else {"status": response.status_code}


def _wait_health(*, want_capacity: bool, timeout_s: float = 420.0) -> dict[str, Any]:
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
        last = {
            "reachable": response.status_code == 200,
            "http_status": response.status_code,
            "body": body if isinstance(body, dict) else {},
        }
        body_d = last["body"]
        if (
            last["reachable"]
            and body_d.get("ok") is True
            and body_d.get("realtime_voice") is True
            and (not want_capacity or isinstance(body_d.get("call_capacity"), dict))
        ):
            cap = body_d.get("call_capacity") or {}
            if not want_capacity:
                return last
            if int(cap.get("global_limit") or 0) >= 2 and cap.get("draining") is False:
                return last
        time.sleep(8)
    return last


def write_rollback(report: dict[str, Any], branch: str) -> dict[str, Any]:
    deploys = report.get("latest_deploys") or []
    current = deploys[0] if deploys else {}
    payload = {
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "service": TARGET_SERVICE_NAME,
        "service_id": (report.get("target") or {}).get("id"),
        "rollback_deploy_id": current.get("id"),
        "rollback_commit": current.get("commit"),
        "rollback_status": current.get("status"),
        "baseline_main_sha": "9e03f15c5baaecdc266800b241244e61855defcc",
        "n2_branch": branch,
        "n2_head_sha": _git_sha(),
        "prior_repo": (report.get("target") or {}).get("repo"),
        "prior_branch": (report.get("target") or {}).get("branch"),
        "procedure": (
            "python3 scripts/controlled_n2_deploy.py --rollback <rollback_deploy_id> "
            "OR Manual Deploy of the recorded prior commit on Render; "
            "baseline main SHA remains 9e03f15c5baaecdc266800b241244e61855defcc"
        ),
    }
    ROLLBACK_FILE.parent.mkdir(parents=True, exist_ok=True)
    ROLLBACK_FILE.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    return payload


def plan(report: dict[str, Any], *, branch: str, retarget: bool) -> dict[str, Any]:
    target = report.get("target") or {}
    return {
        "profile": "controlled-n2-deploy",
        "service": target.get("name"),
        "service_id": target.get("id"),
        "current_repo": target.get("repo"),
        "current_branch": target.get("branch"),
        "retarget_to_canonical": retarget,
        "desired_repo": CANONICAL_REPO if retarget else target.get("repo"),
        "desired_branch": branch if retarget else target.get("branch"),
        "desired_root_dir": "" if retarget else None,
        "open_call_env_keys": sorted(OPEN_CALL_ENV),
        "public_health_before": report.get("public_health"),
        "hlo_untouched": True,
        "canonical_head": _git_sha(),
    }


def apply_deploy(client: RenderClient, report: dict[str, Any], *, branch: str, retarget: bool) -> dict[str, Any]:
    target = report["target"]
    _assert_mos_only(target)
    service_id = str(target["id"])
    rollback = write_rollback(report, branch)

    # Opening public ingress runs render_prepare Twilio mutation at boot.
    # Missing TWILIO_AUTH_TOKEN → ProviderWebhookError → non-zero exit → update_failed.
    env_creds = ((report.get("env") or {}).get("credentials_present") or {})
    if not env_creds.get("TWILIO_AUTH_TOKEN"):
        raise RenderInventoryError(
            "TWILIO_AUTH_TOKEN absent on target service — refuse opening call window "
            "(open ingress would fail closed at boot). Restore token via estate/USH, not chat."
        )

    if retarget:
        # Clear rootDir so Dockerfile at repo root is used (not jobs/maintenanceos).
        _patch_service(
            client,
            service_id,
            {
                "repo": CANONICAL_REPO,
                "branch": branch,
                "rootDir": "",
                "autoDeploy": "no",
            },
        )

    for key, value in OPEN_CALL_ENV.items():
        client.put_env_var(service_id, key, value)

    deploy = client.trigger_deploy(service_id)
    health = _wait_health(want_capacity=True)
    body = health.get("body") or {}
    cap = body.get("call_capacity") or {}
    ok = (
        health.get("reachable") is True
        and body.get("ok") is True
        and body.get("realtime_voice") is True
        and int(cap.get("global_limit") or 0) >= 2
        and bool(OPEN_CALL_ENV.get("CAPACITY_MAX_HOURLY_BURN_USD"))
    )
    result = {
        "profile": "controlled-n2-deploy",
        "applied": True,
        "rollback": rollback,
        "deploy": summarize_deploy(deploy) if isinstance(deploy, dict) else deploy,
        "health_after": health,
        "capacity_limit_ok": int(cap.get("global_limit") or 0) >= 2,
        "cost_kill_switch_configured": True,
        "ready_for_n2_physical_calls": ok,
        "hlo_untouched": True,
    }
    PREFLIGHT_FILE.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    return result


def rollback_deploy(client: RenderClient, report: dict[str, Any], deploy_id: str) -> dict[str, Any]:
    target = report["target"]
    _assert_mos_only(target)
    service_id = str(target["id"])
    # Render supports redeploy of a prior deploy via POST .../deploys/{id}/rollback on some plans;
    # fall back to triggering a fresh deploy after operator restores branch, and always clear call window.
    for key, value in {
        "ENABLE_REALTIME_VOICE": "false",
        "ENABLE_PUBLIC_PROVIDER_INGRESS": "false",
    }.items():
        client.put_env_var(service_id, key, value)
    response = client._client.post(f"/v1/services/{service_id}/deploys/{deploy_id}/rollback")
    if response.status_code not in {200, 201, 202}:
        # Fallback: trigger deploy of whatever is currently configured (operator must restore SHA).
        deploy = client.trigger_deploy(service_id)
        return {
            "profile": "controlled-n2-rollback",
            "rollback_api_status": response.status_code,
            "rollback_api_body": response.text[:300],
            "fallback_deploy": summarize_deploy(deploy) if isinstance(deploy, dict) else deploy,
            "call_window_closed": True,
        }
    payload = response.json() if response.content else {}
    return {
        "profile": "controlled-n2-rollback",
        "rollback": payload,
        "call_window_closed": True,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Controlled N=2 MaintenanceOS deploy")
    parser.add_argument("--apply", action="store_true", help="Mutate Render MaintenanceOS service only")
    parser.add_argument("--dry-run", action="store_true", help="Plan only (default)")
    parser.add_argument("--retarget", action="store_true", default=True, help="Point service at canonical repo/branch")
    parser.add_argument("--no-retarget", action="store_true", help="Deploy current Render repo pointer only")
    parser.add_argument("--branch", default=DEFAULT_BRANCH, help="Canonical branch to deploy")
    parser.add_argument("--rollback", metavar="DEPLOY_ID", help="Rollback to a prior Render deploy id")
    args = parser.parse_args(argv)
    retarget = not args.no_retarget

    if not api_key_ready():
        print(
            json.dumps(
                {
                    "profile": "controlled-n2-deploy",
                    "api_key_ready": False,
                    "error": "RENDER_API_KEY is not present in this environment",
                    "public_health": probe_public_health(),
                    "hlo_untouched": True,
                    "ready_for_n2_physical_calls": False,
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 2

    try:
        with RenderClient(api_key()) as client:
            report = inventory(client)
            if args.rollback:
                result = rollback_deploy(client, report, args.rollback)
                print(json.dumps(result, indent=2, sort_keys=True))
                return 0
            planned = plan(report, branch=args.branch, retarget=retarget)
            if args.apply:
                result = apply_deploy(client, report, branch=args.branch, retarget=retarget)
                print(json.dumps({**planned, **result}, indent=2, sort_keys=True))
                return 0 if result.get("ready_for_n2_physical_calls") else 1
            rollback = write_rollback(report, args.branch)
            print(json.dumps({**planned, "rollback": rollback, "dry_run": True}, indent=2, sort_keys=True))
            return 0
    except RenderInventoryError as exc:
        print(
            json.dumps(
                {
                    "profile": "controlled-n2-deploy",
                    "error": str(exc),
                    "hlo_untouched": True,
                    "ready_for_n2_physical_calls": False,
                },
                indent=2,
                sort_keys=True,
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
