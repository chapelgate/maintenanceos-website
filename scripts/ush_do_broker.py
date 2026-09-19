"""Discover / manage DigitalOcean MaintenanceOS resources via USH (never raw DO token).

Fail-closed when durable MOS workload identity is absent or cannot renew.
Does not start secret-retry loops. Never prints secret material.
Never treats USH issue_token() bearers as permanent USH_WORKLOAD_TOKEN.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import ush_client  # noqa: E402
import ush_identity  # noqa: E402


def main() -> int:
    ush_client.forbid_cursor_digitalocean_token()
    report: dict = {
        "ush_health": ush_client.health(),
        "release_gates": ush_client.release_gates(),
        "identity": ush_identity.get_runtime().status(),
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
    if not gates.get("durable_workload_identity_present"):
        report["error"] = "USH_DURABLE_IDENTITY_REQUIRED"
        report["note"] = (
            "Need renewable Ed25519 workload identity under ush-identity/; "
            "do not store 3600s issue_token bearers as USH_WORKLOAD_TOKEN; "
            "do not inject DIGITALOCEAN_TOKEN into Cursor"
        )
        print(json.dumps(report, indent=2))
        return 4
    try:
        ush_identity.get_runtime().ensure_access_token()
        report["isolation"] = ush_client.assert_project_isolation()
        report["discover"] = ush_client.digitalocean_discover()
        report["apps"] = ush_client.digitalocean_list_apps()
    except (ush_client.UshError, ush_identity.UshIdentityError) as exc:
        code = getattr(exc, "code", type(exc).__name__)
        detail = getattr(exc, "detail", str(exc))
        report["error"] = f"{code}:{detail}"
        print(json.dumps(report, indent=2))
        return 5
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
