#!/usr/bin/env python3
"""DO migration preflight — inventory Lane A + DO readiness (no secret values).

Does not mutate Render or DigitalOcean. Does not resubscribe credential timers.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from secrets_handler import presence_map, voice_provider_credentials_ready, digitalocean_token  # noqa: E402

LANE_A_SERVICE_ID = "srv-dahhskafngtc739pnplg"
LANE_A_URL = "https://maintenanceos-redteam-v2.onrender.com"
OUT = ROOT / "docs" / "migration" / "LANE_A_INVENTORY.json"


def _render_inventory() -> dict:
    key = (os.getenv("RENDER_API_KEY") or "").strip()
    if not key:
        return {"ok": False, "error": "RENDER_API_KEY_absent"}
    headers = {"Authorization": f"Bearer {key}", "Accept": "application/json"}

    def get(path: str):
        req = urllib.request.Request(f"https://api.render.com/v1{path}", headers=headers)
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())

    svc_body = get(f"/services/{LANE_A_SERVICE_ID}")
    svc = svc_body.get("service") or svc_body
    deploys = get(f"/services/{LANE_A_SERVICE_ID}/deploys?limit=1")
    dep = (deploys[0].get("deploy") if deploys else {}) or {}
    commit = dep.get("commit") or {}
    envs = get(f"/services/{LANE_A_SERVICE_ID}/env-vars")
    keys = sorted((e.get("envVar") or e).get("key") for e in envs)
    secretish = lambda k: any(x in (k or "").upper() for x in ("KEY", "TOKEN", "SECRET", "PASSWORD", "SID", "DATABASE"))
    nonsecret = {}
    for e in envs:
        ev = e.get("envVar") or e
        k = ev.get("key")
        if k and not secretish(k):
            nonsecret[k] = ev.get("value")
    health = {}
    try:
        with urllib.request.urlopen(f"{LANE_A_URL}/health", timeout=30) as resp:
            health = json.loads(resp.read().decode())
    except Exception as exc:
        health = {"ok": False, "error": type(exc).__name__}
    return {
        "ok": True,
        "service": {
            "name": svc.get("name"),
            "id": svc.get("id"),
            "branch": svc.get("branch"),
            "repo": svc.get("repo"),
            "autoDeploy": svc.get("autoDeploy"),
            "url": (svc.get("serviceDetails") or {}).get("url"),
            "region": (svc.get("serviceDetails") or {}).get("region"),
            "plan": (svc.get("serviceDetails") or {}).get("plan"),
        },
        "deploy": {
            "id": dep.get("id"),
            "status": dep.get("status"),
            "sha": commit.get("id") if isinstance(commit, dict) else dep.get("commitId"),
            "message": ((commit.get("message") or "")[:160] if isinstance(commit, dict) else None),
            "finishedAt": dep.get("finishedAt"),
        },
        "env_keys": keys,
        "config_nonsecret": nonsecret,
        "secret_key_presence": {
            k: k in keys
            for k in (
                "OPENAI_API_KEY",
                "TWILIO_ACCOUNT_SID",
                "TWILIO_AUTH_TOKEN",
                "TWILIO_PHONE_NUMBER",
                "RESEND_API_KEY",
                "GEMINI_API_KEY",
                "DATABASE_URL",
                "APP_SECRET",
            )
        },
        "health": {
            "ok": health.get("ok"),
            "realtime_voice": health.get("realtime_voice"),
            "call_capacity": health.get("call_capacity"),
            "pilot": {
                k: (health.get("pilot") or {}).get(k)
                for k in ("armed", "calls_completed", "tenant", "email_gate", "persistence", "max_real_calls")
            },
        },
    }


def _do_probe() -> dict:
    token = digitalocean_token()
    if not token:
        return {
            "ok": False,
            "token_present": False,
            "apps": [],
            "droplets_mos": [],
            "note": "No DIGITALOCEAN_TOKEN — cannot list App Platform or droplets. Stale droplet IDs must not be assumed.",
        }
    req = urllib.request.Request(
        "https://api.digitalocean.com/v2/apps?per_page=100",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        apps = json.loads(resp.read().decode()).get("apps", [])
    mos_apps = [
        {
            "id": a.get("id"),
            "name": (a.get("spec") or {}).get("name"),
            "live_url": a.get("live_url"),
            "region": (a.get("region") or {}).get("slug") if isinstance(a.get("region"), dict) else a.get("region"),
        }
        for a in apps
        if "maintenance" in ((a.get("spec") or {}).get("name") or "").lower()
        or "mos" in ((a.get("spec") or {}).get("name") or "").lower()
    ]
    return {"ok": True, "token_present": True, "app_count": len(apps), "mos_apps": mos_apps}


def main() -> int:
    report = {
        "profile": "do-migration-preflight",
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "n2_secrets_retry_cancelled": True,
        "feature_freeze": True,
        "render_untouched": True,
        "lane_a": _render_inventory(),
        "digitalocean": _do_probe(),
        "agent_secret_presence": presence_map(),
        "voice_credentials": voice_provider_credentials_ready(),
        "n2_baseline_preserved": {
            "evidence": "docs/concurrency_100_evidence/n2-live-evidence-report.json",
            "programme_status": "INTEGRATION",
            "do_not_rerun_for_missing_resend": True,
        },
        "resend": {
            "required_for_voice": False,
            "present": bool(presence_map().get("RESEND_API_KEY")),
            "status": "absent_email_only_optional",
        },
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"ok": True, "wrote": str(OUT), "do_token": report["digitalocean"]["token_present"], "lane_a_ok": report["lane_a"].get("ok")}, indent=2))
    return 0 if report["lane_a"].get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
