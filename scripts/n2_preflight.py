#!/usr/bin/env python3
"""Preflight checks before Andy places N=2 simultaneous live calls.

Probes public /health and records boolean-only evidence. Does not place calls.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "concurrency_100_evidence" / "n2-preflight.json"
PUBLIC_BASE = os.getenv("PUBLIC_BASE_URL", "https://maintenanceos-redteam-v2.onrender.com").rstrip("/")


def main() -> int:
    health_url = f"{PUBLIC_BASE}/health"
    try:
        response = httpx.get(health_url, timeout=90.0)
        body = response.json() if response.content else {}
    except (httpx.HTTPError, ValueError) as exc:
        report = {
            "profile": "n2-preflight",
            "ok": False,
            "error": exc.__class__.__name__,
            "health_url": health_url,
        }
        OUT.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
        print(json.dumps(report, indent=2, sort_keys=True))
        return 1

    cap = body.get("call_capacity") if isinstance(body, dict) else None
    cap = cap if isinstance(cap, dict) else {}
    rollback_path = ROOT / "docs" / "concurrency_100_evidence" / "n2-rollback-point.json"
    rollback_ready = rollback_path.exists()
    global_limit = int(cap.get("global_limit") or 0)
    kill_switch = "CAPACITY_MAX_HOURLY_BURN_USD"  # presence proven after deploy env set; health exposes burn
    report = {
        "profile": "n2-preflight",
        "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "health_http_ok": response.status_code == 200,
        "health_ok": bool(isinstance(body, dict) and body.get("ok") is True),
        "realtime_voice": bool(isinstance(body, dict) and body.get("realtime_voice") is True),
        "capacity_present": bool(cap),
        "concurrency_capacity_gte_2": global_limit >= 2,
        "global_limit": global_limit,
        "draining": bool(cap.get("draining")),
        "estimated_hourly_burn_usd": cap.get("estimated_hourly_burn_usd"),
        "cost_kill_switch_signal_present": "estimated_hourly_burn_usd" in cap,
        "rollback_point_file_present": rollback_ready,
        "email_sender_not_probed_here": True,
        "twilio_webhook_not_mutated_here": True,
        "wss_not_opened_here": True,
        "gemini_not_opened_here": True,
        "ready_for_andy_n2_calls": False,
    }
    report["ready_for_andy_n2_calls"] = all(
        [
            report["health_http_ok"],
            report["health_ok"],
            report["realtime_voice"],
            report["capacity_present"],
            report["concurrency_capacity_gte_2"],
            not report["draining"],
            report["cost_kill_switch_signal_present"],
            report["rollback_point_file_present"],
        ]
    )
    # Note: Twilio/WSS/Gemini/email require deploy-time / readiness evidence; filled by controlled_n2_deploy.
    OUT.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["ready_for_andy_n2_calls"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
