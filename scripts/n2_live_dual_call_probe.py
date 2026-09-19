#!/usr/bin/env python3
"""Place TWO simultaneous live PSTN calls into the MaintenanceOS public number.

Uses Twilio REST to create two inbound legs against TWILIO_PHONE_NUMBER (the
dedicated MOS test number). Does not print credentials, full SIDs, or raw
phone numbers — only redacted refs and overlap evidence.

Requires env:
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
Optional:
  TWILIO_FROM_NUMBER / TWILIO_HUMAN_TRANSFER_NUMBER (must be allowed From)
  TWILIO_FROM_NUMBER_2 (second distinct From for true dual-leg independence)
  N2_CALL_HOLD_SECONDS (default 45)
  PUBLIC_BASE_URL (default Lane A health host)
  N2_EVIDENCE_OUT (default docs/concurrency_100_evidence/n2-live-dual-call.json)
  N2_SECRETS_FILE (default /tmp/n2-live-secrets.env — loaded if present)

Exit 0 only when both calls overlap in-progress and health showed active>=2
with distinct call refs (no shared call ID).
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
SECRETS_FILE = Path(os.getenv("N2_SECRETS_FILE", "/tmp/n2-live-secrets.env"))


def _load_secrets_file(path: Path) -> None:
    """Load KEY=VALUE lines into os.environ if not already set (no overwrite)."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value and not (os.getenv(key) or "").strip():
            os.environ[key] = value


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
    _load_secrets_file(SECRETS_FILE)
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
    for key in (
        "TWILIO_FROM_NUMBER",
        "TWILIO_FROM_NUMBER_2",
        "TWILIO_HUMAN_TRANSFER_NUMBER",
        "TWILIO_SECOND_NUMBER",
    ):
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
    pilot_pre = body.get("pilot") if isinstance(body.get("pilot"), dict) else {}
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

    client = Client(account, auth)
    placed: list[dict[str, Any]] = []
    placed_sids: list[str] = []
    errors: list[str] = []
    t0 = time.time()
    for idx in (1, 2):
        from_number = from_candidates[(idx - 1) % len(from_candidates)]
        # Distinct spoken marker per leg so transcripts (if captured) cannot be shared.
        twiml = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            "<Response>"
            '<Pause length="2"/>'
            f'<Say voice="Polly.Amy">MaintenanceOS N2 probe caller {idx}.</Say>'
            f'<Pause length="{max(20, HOLD_S)}"/>'
            "<Hangup/>"
            "</Response>"
        )
        try:
            call = client.calls.create(
                to=mos_number,
                from_=from_number,
                twiml=twiml,
                timeout=30,
            )
            placed_sids.append(call.sid)
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

    # Poll health for simultaneous active peak + distinct call isolation signals
    peak_active = 0
    overlap_window: dict[str, Any] | None = None
    samples: list[dict[str, Any]] = []
    deadline = time.time() + HOLD_S + 15
    while time.time() < deadline:
        snap = _health()
        b = snap.get("body") or {}
        c = b.get("call_capacity") if isinstance(b.get("call_capacity"), dict) else {}
        active = int(c.get("active") or b.get("active_calls") or 0)
        peak_active = max(peak_active, active)
        sample = {
            "at": _iso(),
            "active": active,
            "by_client_keys": len(c.get("by_client") or {}),
        }
        samples.append(sample)
        if active >= 2 and overlap_window is None:
            overlap_window = {
                "first_observed_at": sample["at"],
                "active": active,
                "elapsed_seconds": round(time.time() - t0, 2),
            }
        if peak_active >= 2 and time.time() - t0 >= 8:
            break
        time.sleep(2)

    recent = []
    final_statuses: list[dict[str, Any]] = []
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

    # Wait for placed legs to leave in-progress, then force-complete stragglers.
    settle_deadline = time.time() + 90
    while time.time() < settle_deadline and placed_sids:
        still_live = False
        final_statuses = []
        for sid in placed_sids:
            try:
                record = client.calls(sid).fetch()
                final_statuses.append(
                    {
                        "call_ref": _token(sid),
                        "status": record.status,
                        "duration_seconds": int(record.duration)
                        if str(record.duration or "").isdigit()
                        else None,
                        "start": record.start_time.isoformat() if record.start_time else None,
                        "end": record.end_time.isoformat() if record.end_time else None,
                    }
                )
                if record.status in {"queued", "ringing", "in-progress"}:
                    still_live = True
            except Exception as exc:
                errors.append(f"fetch_{exc.__class__.__name__}")
        if not still_live:
            break
        time.sleep(3)
    try:
        for sid in placed_sids:
            try:
                record = client.calls(sid).fetch()
                if record.status in {"queued", "ringing", "in-progress"}:
                    client.calls(sid).update(status="completed")
            except Exception:
                pass
    except Exception:
        pass

    post = _health()
    post_body = post.get("body") or {}
    post_pilot = post_body.get("pilot") if isinstance(post_body.get("pilot"), dict) else {}
    overlap = peak_active >= 2
    both_placed = len(placed) == 2
    distinct_refs = len({row["call_ref"] for row in placed}) == 2
    completed_ok = (
        len(final_statuses) == 2
        and all(row.get("status") in {"completed", "busy", "no-answer", "canceled", "failed"} for row in final_statuses)
        and all(row.get("status") == "completed" for row in final_statuses)
    )
    # Prefer completed; allow PASS only when both completed normally after overlap.
    passed = both_placed and distinct_refs and overlap and completed_ok and not errors
    report = {
        "profile": "n2-live-dual-call",
        "ok": True,
        "pass": passed,
        "generated_at": _iso(),
        "public_base": PUBLIC_BASE,
        "hold_seconds": HOLD_S,
        "mos_number_ref": _token(mos_number),
        "from_number_refs": [_token(n) for n in from_candidates[:2]],
        "placed_count": len(placed),
        "placed": placed,
        "placed_call_refs_distinct": distinct_refs,
        "final_leg_statuses": final_statuses,
        "errors": errors,
        "peak_active_observed": peak_active,
        "overlap_active_ge_2": overlap,
        "overlap_window": overlap_window,
        "health_samples": samples[:30],
        "recent_to_number_calls": recent[:10],
        "pre_health": {
            "global_limit": cap.get("global_limit"),
            "active": cap.get("active"),
            "realtime_voice": body.get("realtime_voice"),
            "pilot_calls_completed": pilot_pre.get("calls_completed"),
            "emails_delivered": (pilot_pre.get("scorecard") or {}).get("emails_successfully_delivered")
            if isinstance(pilot_pre.get("scorecard"), dict)
            else None,
        },
        "post_health": {
            "active": ((post_body.get("call_capacity") or {}) if isinstance(post_body.get("call_capacity"), dict) else {}).get(
                "active"
            ),
            "pilot_calls_completed": post_pilot.get("calls_completed"),
            "emails_delivered": (post_pilot.get("scorecard") or {}).get("emails_successfully_delivered")
            if isinstance(post_pilot.get("scorecard"), dict)
            else None,
        },
        "acceptance": {
            "two_real_calls_placed": both_placed,
            "simultaneous_active_observed": overlap,
            "independent_legs_distinct_call_ids": distinct_refs,
            "both_terminated_completed": completed_ok,
            "no_shared_call_id": distinct_refs,
        },
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
