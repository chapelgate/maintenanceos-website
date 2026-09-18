#!/usr/bin/env python3
"""Discover / manage DigitalOcean MaintenanceOS resources via USH (never raw DO token).

Fail-closed when USH_WORKLOAD_TOKEN is absent. Does not start secret-retry loops.
Never prints secret material.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import ush_client  # noqa: E402


def main() -> int:
    ush_client.forbid_cursor_digitalocean_token()
    report: dict = {
        "ush_health": ush_client.health(),
        "release_gates": ush_client.release_gates(),
        "isolation": None,
        "discover": None,
        "apps": None,
        "error": None,
    }
    gates = report["release_gates"]["gates"]
    if not gates.get("ush_reachable"):
        report["error"] = "USH_UNREACHABLE"
        print(json.dumps(report, indent=2))
        return 2
    if not gates.get("digitalocean_adapter_registered"):
        report["error"] = "DO_ADAPTER_MISSING"
        print(json.dumps(report, indent=2))
        return 3
    if not gates.get("workload_identity_present"):
        report["error"] = "USH_PRINCIPAL_GRANT_REQUIRED"
        report["human_action"] = {
            "do_not": "paste DIGITALOCEAN_TOKEN into Cursor / chat / Git / PR",
            "do": (
                "On USH (chapelgate-ush-1 / https://68.183.44.222) register principal "
                "id=maintenanceos-v1-pilot kind=application project=maintenanceos "
                "environment=london tenant=chapelgate with explicit policy grant for "
                "digitalocean apps.* — deliver USH_WORKLOAD_TOKEN into MOS secrets store only"
            ),
            "ush_repo": "github.com/chapelgate/chapelgate-universal-secrets-handler.",
            "evidence_do_already_vaulted": True,
            "do_profile": report["ush_health"].get("digitalocean_profile"),
        }
        print(json.dumps(report, indent=2))
        return 4
    try:
        report["isolation"] = ush_client.assert_project_isolation()
        report["discover"] = ush_client.digitalocean_discover()
        report["apps"] = ush_client.digitalocean_list_apps()
    except ush_client.UshError as exc:
        report["error"] = f"{exc.code}:{exc.detail}"
        print(json.dumps(report, indent=2))
        return 5
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
