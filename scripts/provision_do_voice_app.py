#!/usr/bin/env python3
"""Create/update a DigitalOcean App Platform London MaintenanceOS runtime.

Migration mode defaults (pre-Twilio-cutover):
- ENABLE_PUBLIC_PROVIDER_INGRESS=false
- ENABLE_REALTIME_VOICE=false until gates pass
- Matches Lane A concurrency (GLOBAL/PER_CLIENT=2) when MOS_LANE_A_PARITY=1

Provides always-on HTTPS + WebSocket (*.ondigitalocean.app). Dedicated lon1
droplet remains available via provision_do_voice_droplet.py when a hostname is ready.

Requires DIGITALOCEAN_TOKEN. Never prints secret values. Never touches Render.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from secrets_handler import digitalocean_token, get_secret, require_secrets  # noqa: E402

API = "https://api.digitalocean.com/v2"
APP_NAME = os.getenv("MOS_DO_APP_NAME", "maintenanceos-london").strip() or "maintenanceos-london"


def _token() -> str:
    return digitalocean_token()


def _request(method: str, path: str, payload: dict | None = None) -> dict:
    token = _token()
    if not token:
        raise SystemExit("MISSING_SECRET:DIGITALOCEAN_TOKEN")
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read().decode() or "{}")
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"DO API {exc.code}: {exc.read().decode()[:500]}") from exc


def _secret_envs() -> list[dict]:
    # Pre-cutover migration: voice provider OpenAI (Lane A proven) OR Gemini.
    # Resend is optional and must not block provision.
    parity = (os.getenv("MOS_LANE_A_PARITY") or "1").strip().lower() in {"1", "true", "yes", "on"}
    cutover = (os.getenv("MOS_DO_CUTOVER_READY") or "").strip().lower() in {"1", "true", "yes", "on"}

    get_secret("OPENAI_API_KEY")
    get_secret("GEMINI_API_KEY")
    if not get_secret("APP_SECRET"):
        import secrets as _secrets

        os.environ["APP_SECRET"] = _secrets.token_hex(32)
    voice = (os.getenv("VOICE_PROVIDER") or ("openai" if get_secret("OPENAI_API_KEY") else "gemini")).strip().lower()
    if voice == "openai":
        required = ["OPENAI_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", "APP_SECRET"]
    else:
        required = ["GEMINI_API_KEY", "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", "APP_SECRET"]
    missing = require_secrets(required)
    # Transfer number optional until cutover; mirror phone if unset for schema completeness
    if not get_secret("TWILIO_HUMAN_TRANSFER_NUMBER") and get_secret("TWILIO_PHONE_NUMBER"):
        os.environ["TWILIO_HUMAN_TRANSFER_NUMBER"] = os.environ["TWILIO_PHONE_NUMBER"]
    if missing:
        raise SystemExit("MISSING_SECRET:" + ",".join(missing))
    if not get_secret("DATABASE_URL"):
        os.environ["DATABASE_URL"] = "sqlite:////tmp/maintenanceos-voice.db"

    def sec(key: str) -> dict:
        return {"key": key, "value": os.environ[key], "scope": "RUN_TIME", "type": "SECRET"}

    def gen(key: str, value: str) -> dict:
        return {"key": key, "value": value, "scope": "RUN_TIME", "type": "GENERAL"}

    ingress = "true" if cutover else "false"
    realtime = "true" if cutover else "false"
    envs = [
        sec("TWILIO_ACCOUNT_SID"),
        sec("TWILIO_AUTH_TOKEN"),
        sec("TWILIO_PHONE_NUMBER"),
        sec("TWILIO_HUMAN_TRANSFER_NUMBER"),
        sec("APP_SECRET"),
        sec("DATABASE_URL"),
        gen("VOICE_PROVIDER", voice),
        gen("VERIFY_TWILIO_SIGNATURES", "true" if not parity else "false"),
        gen("ENABLE_PUBLIC_PROVIDER_INGRESS", ingress),
        gen("ENABLE_REALTIME_VOICE", realtime),
        gen("TWILIO_TTS_LANGUAGE", "en-GB"),
        gen("TWILIO_TTS_VOICE", "Polly.Amy"),
        gen("ENABLE_LIVE_EMAIL", "false"),
        gen("ENABLE_LIVE_MESSAGING", "false"),
        gen("ENABLE_CONTRACTOR_PORTAL", "false"),
        gen("ALLOW_REMOTE_AI_SIDE_EFFECT_ENABLE", "false"),
        gen("EMAIL_MODE", "mock"),
        gen("ENABLE_STRUCTURED_LOGGING", "true"),
        gen("DATABASE_DEPLOYMENT_MODE", "local" if os.environ["DATABASE_URL"].startswith("sqlite:") else "managed_test"),
        gen("DATABASE_TLS_REQUIRED", "false" if os.environ["DATABASE_URL"].startswith("sqlite:") else "true"),
        gen("PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE", "60"),
        gen("PUBLIC_WS_RATE_LIMIT_PER_MINUTE", "20"),
        gen("GLOBAL_MAX_CONCURRENT_CALLS", "2"),
        gen("PER_CLIENT_MAX_CONCURRENT_CALLS", "2"),
        gen("VOICE_TENANT_MODE", "isolated_test"),
        {
            "key": "PUBLIC_BASE_URL",
            "scope": "RUN_TIME",
            "type": "GENERAL",
            "value": "${APP_URL}",
        },
    ]
    if voice == "gemini":
        envs.append(sec("GEMINI_API_KEY"))
        envs.append(gen("GEMINI_LIVE_MODEL", os.getenv("GEMINI_LIVE_MODEL", "gemini-3.1-flash-live-preview")))
        envs.append(gen("GEMINI_LIVE_VOICE", os.getenv("GEMINI_LIVE_VOICE", "Aoede")))
    else:
        envs.append(sec("OPENAI_API_KEY"))
    if get_secret("GOOGLE_API_KEY"):
        envs.append(sec("GOOGLE_API_KEY"))
    if get_secret("RESEND_API_KEY"):
        envs.append(sec("RESEND_API_KEY"))
        if (os.getenv("SMTP_FROM") or "").strip():
            envs.append(gen("SMTP_FROM", os.environ["SMTP_FROM"]))
    return envs


def _spec(branch: str) -> dict:
    return {
        "name": APP_NAME,
        "region": "lon",
        "services": [
            {
                "name": "web",
                "github": {
                    "repo": "chapelgate/maintenanceos-v1-pilot",
                    "branch": branch,
                    "deploy_on_push": False,
                },
                "dockerfile_path": "Dockerfile",
                "http_port": 8000,
                "instance_count": 1,
                "instance_size_slug": "professional-xs",
                "health_check": {
                    "http_path": "/health",
                    "initial_delay_seconds": 10,
                    "period_seconds": 15,
                    "timeout_seconds": 5,
                    "success_threshold": 1,
                    "failure_threshold": 3,
                },
                "envs": _secret_envs(),
            }
        ],
        "ingress": {"rules": [{"component": {"name": "web"}, "match": {"path": {"prefix": "/"}}}]},
        "alerts": [{"rule": "DEPLOYMENT_FAILED"}, {"rule": "DOMAIN_FAILED"}],
    }


def main() -> int:
    branch = (os.getenv("MOS_DEPLOY_BRANCH") or "cursor/do-migration-reconcile-e283").strip()
    if not _token():
        raise SystemExit("MISSING_SECRET:DIGITALOCEAN_TOKEN")
    apps = _request("GET", "/apps?per_page=100").get("apps", [])
    existing = next((a for a in apps if a.get("spec", {}).get("name") == APP_NAME), None)
    spec = _spec(branch)
    if existing:
        app_id = existing["id"]
        _request("PUT", f"/apps/{app_id}", {"spec": spec})
        action = "updated"
    else:
        created = _request("POST", "/apps", {"spec": spec})
        app_id = created["app"]["id"]
        action = "created"
        existing = created["app"]

    # Wait briefly for live URL
    url = ""
    for _ in range(36):
        app = _request("GET", f"/apps/{app_id}")["app"]
        url = (app.get("live_url") or "").rstrip("/")
        if url:
            break
        time.sleep(5)

    print(
        json.dumps(
            {
                "ok": True,
                "action": action,
                "app_id": app_id,
                "name": APP_NAME,
                "region": "lon",
                "live_url": url,
                "branch": branch,
                "twilio_route_unchanged": True,
                "ingress_enabled": (os.getenv("MOS_DO_CUTOVER_READY") or "").strip().lower()
                in {"1", "true", "yes", "on"},
                "rollback_render": "https://maintenanceos-redteam-v2.onrender.com",
                "resend_optional": True,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
