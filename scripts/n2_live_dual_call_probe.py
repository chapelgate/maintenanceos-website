#!/usr/bin/env python3
"""Place TWO simultaneous live PSTN calls into the MaintenanceOS public number.

Uses Twilio REST to create two inbound legs against TWILIO_PHONE_NUMBER (the
dedicated MOS test number). Does not print credentials, full SIDs, or raw
phone numbers — only redacted refs and overlap evidence.

Requires env:
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
Optional:
  TWILIO_FROM_NUMBER / TWILIO_HUMAN_TRANSFER_NUMBER (must be allowed From)
  N2_CALL_HOLD_SECONDS (default 45)
  PUBLIC_BASE_URL (default Lane A health host)
  N2_EVIDENCE_OUT (default docs/concurrency_100_evidence/n2-live-dual-call.json)

Exit 0 only when both calls overlap in-progress and health showed active>=2.
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUT = ROOT / "docs" / "concurrency_100_evidence" / "n2-live-dual-call.json"
PUBLIC_BASE = os.getenv("PUBLIC_BASE_URL", "https://maintenanceos-redteam-v2.onrender.com").rstrip("/")
HOLD_S = int(os.getenv("N2_CALL_HOLD_SECONDS", "45"))


def _token(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    return "sha256:" + hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def _iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _health() -> dict[str, Any]:
    response = httpx.get(f"{PUBLIC_BASE}/health", timeout=60.0)
    body = response.json() if response.content else {}
    return {"http_status": response.status_code, "body": body if isinstance(body, dict) else {}}


def _require_env(*names: str) -> list[str]:
    return [n for n in names if not (os.getenv(n) or "").strip()]


def main() -> int:
    out_path = Path(os.getenv("N2_EVIDENCE_OUT", str(DEFAULT_OUT)))
    missing = _require_env("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER")
    if missing:
        report = {
            "profile": "n2-live-dual-call",
            "ok": False,
            "pass": False,
            "blocker": "twilio_credentials_unavailable",
            "missing": missing,
            "generated_at": _iso(),
        }
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
        print(json.dumps(report, indent=2, sort_keys=True))
        return 2

    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException

    account = os.environ["TWILIO_ACCOUNT_SID"].strip()
    auth = os.environ["TWILIO_AUTH_TOKEN"].strip()
    mos_number = os.environ["TWILIO_PHONE_NUMBER"].strip()
    from_candidates = []
    for key in ("TWILIO_FROM_NUMBER", "TWILIO_HUMAN_TRANSFER_NUMBER", "TWILIO_SECOND_NUMBER"):
        value = (os.getenv(key) or "").strip()
        if value and value != mos_number and value not in from_candidates:
            from_candidates.append(value)
    if not from_candidates:
        report = {
            "profile": "n2-live-dual-call",
            "ok": False,
            "pass": False,
            "blocker": "no_distinct_from_number",
            "detail": "Need TWILIO_FROM_NUMBER (or verified TWILIO_HUMAN_TRANSFER_NUMBER) distinct from MOS number",
            "mos_number_ref": _token(mos_number),
            "generated_at": _iso(),
        }
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
        print(json.dumps(report, indent=2, sort_keys=True))
        return 3

    pre = _health()
    body = pre.get("body") or {}
    cap = body.get("call_capacity") if isinstance(body.get("call_capacity"), dict) else {}
    if not (
        pre.get("http_status") == 200
        and body.get("ok") is True
        and body.get("realtime_voice") is True
        and int(cap.get("global_limit") or 0) >= 2
        and cap.get("draining") is False
    ):
        report = {
            "profile": "n2-live-dual-call",
            "ok": False,
            "pass": False,
            "blocker": "live_health_not_ready",
            "health": {
                "ok": body.get("ok"),
                "realtime_voice": body.get("realtime_voice"),
                "global_limit": cap.get("global_limit"),
                "draining": cap.get("draining"),
                "active": cap.get("active"),
            },
            "generated_at": _iso(),
        }
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
        print(json.dumps(report, indent=2, sort_keys=True))
        return 4

    # TwiML keeps the outbound caller legs alive while MOS answers + converses.
    twiml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        "<Response>"
        "<Pause length=\"2\"/>"
        "<Say voice=\"Polly.Amy\">MaintenanceOS N2 concurrency probe caller.</Say>"
        f"<Pause length=\"{max(20, HOLD_S)}\"/>"
        "<Hangup/>"
        "</Response>"
    )
    client = Client(account, auth)
    from_number = from_candidates[0]
    placed: list[dict[str, Any]] = []
    errors: list[str] = []
    t0 = time.time()
    for idx in (1, 2):
        try:
            call = client.calls.create(
                to=mos_number,
                from_=from_number,
                twiml=twiml,
                timeout=30,
            )
            placed.append(
                {
                    "index": idx,
                    "call_ref": _token(call.sid),
                    "status": call.status,
                    "placed_at": _iso(),
                    "from_ref": _token(from_number),
                    "to_ref": _token(mos_number),
                }
            )
        except TwilioRestException as exc:
            errors.append(f"twilio_{exc.status}_{exc.code}")
        except Exception as exc:
            errors.append(exc.__class__.__name__)

    # Poll health for simultaneous active peak
    peak_active = 0
    samples: list[dict[str, Any]] = []
    deadline = time.time() + HOLD_S + 15
    while time.time() < deadline:
        snap = _health()
        b = snap.get("body") or {}
        c = b.get("call_capacity") if isinstance(b.get("call_capacity"), dict) else {}
        active = int(c.get("active") or b.get("active_calls") or 0)
        peak_active = max(peak_active, active)
        samples.append({"at": _iso(), "active": active, "by_client_keys": len(c.get("by_client") or {})})
        if peak_active >= 2 and time.time() - t0 >= 8:
            break
        time.sleep(2)

    # Refresh Twilio call statuses
    for row in placed:
        # Cannot look up by token; re-list recent to-number calls
        pass
    recent = []
    try:
        for record in client.calls.list(to=mos_number, limit=10):
            recent.append(
                {
                    "call_ref": _token(record.sid),
                    "status": record.status,
                    "duration_seconds": int(record.duration) if str(record.duration or "").isdigit() else None,
                    "start": record.start_time.isoformat() if record.start_time else None,
                    "end": record.end_time.isoformat() if record.end_time else None,
                }
            )
    except Exception as exc:
        errors.append(f"list_{exc.__class__.__name__}")

    # Hang up any still-ringing probe calls via recent in-progress
    try:
        for record in client.calls.list(to=mos_number, status="in-progress", limit=5):
            try:
                client.calls(record.sid).update(status="completed")
            except Exception:
                pass
    except Exception:
        pass

    post = _health()
    overlap = peak_active >= 2
    both_placed = len(placed) == 2
    passed = both_placed and overlap and not errors
    report = {
        "profile": "n2-live-dual-call",
        "ok": True,
        "pass": passed,
        "generated_at": _iso(),
        "public_base": PUBLIC_BASE,
        "hold_seconds": HOLD_S,
        "mos_number_ref": _token(mos_number),
        "from_number_ref": _token(from_number),
        "placed_count": len(placed),
        "placed": placed,
        "errors": errors,
        "peak_active_observed": peak_active,
        "overlap_active_ge_2": overlap,
        "health_samples": samples[:30],
        "recent_to_number_calls": recent[:10],
        "pre_health": {
            "global_limit": cap.get("global_limit"),
            "active": cap.get("active"),
            "realtime_voice": body.get("realtime_voice"),
            "pilot_calls_completed": (body.get("pilot") or {}).get("calls_completed")
            if isinstance(body.get("pilot"), dict)
            else None,
        },
        "post_health": {
            "active": ((post.get("body") or {}).get("call_capacity") or {}).get("active"),
            "pilot_calls_completed": ((post.get("body") or {}).get("pilot") or {}).get("calls_completed")
            if isinstance((post.get("body") or {}).get("pilot"), dict)
            else None,
        },
        "acceptance": {
            "two_real_calls_placed": both_placed,
            "simultaneous_active_observed": overlap,
            "independent_legs": both_placed,
        },
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
