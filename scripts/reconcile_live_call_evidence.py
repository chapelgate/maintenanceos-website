"""Read-only Twilio call evidence reconciliation for MaintenanceOS.

This script is designed for cloud execution. It never prints credentials, caller
numbers, transfer numbers, recordings, transcripts, or full provider SIDs. It emits
only redacted operational metadata suitable for an evidence artifact.
"""

from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone

from twilio.rest import Client


def _present(name: str) -> bool:
    return bool((os.getenv(name) or "").strip())


def _token(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    return "sha256:" + hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def _iso(value) -> str | None:
    if value is None:
        return None
    if getattr(value, "tzinfo", None) is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


def main() -> int:
    required = ("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER")
    missing = [name for name in required if not _present(name)]
    if missing:
        print(json.dumps({
            "ready": False,
            "reason": "provider_credentials_unavailable_in_runner",
            "missing": missing,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "calls": [],
        }, indent=2, sort_keys=True))
        return 0

    sid = os.environ["TWILIO_ACCOUNT_SID"].strip()
    token = os.environ["TWILIO_AUTH_TOKEN"].strip()
    number = os.environ["TWILIO_PHONE_NUMBER"].strip()
    client = Client(sid, token)

    calls = {}
    for record in client.calls.list(to=number, limit=50):
        calls[record.sid] = record
    for record in client.calls.list(from_=number, limit=50):
        calls[record.sid] = record

    rows = []
    for record in sorted(calls.values(), key=lambda item: item.date_created or datetime.min.replace(tzinfo=timezone.utc), reverse=True):
        rows.append({
            "call_ref": _token(record.sid),
            "direction": record.direction,
            "status": record.status,
            "duration_seconds": int(record.duration) if str(record.duration or "").isdigit() else None,
            "created_at": _iso(record.date_created),
            "started_at": _iso(record.start_time),
            "ended_at": _iso(record.end_time),
            "price_present": record.price is not None,
        })

    print(json.dumps({
        "ready": True,
        "provider": "twilio",
        "test_number_ref": _token(number),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "call_count": len(rows),
        "calls": rows,
        "limitations": [
            "This proves provider call metadata only, not webhook or WebSocket signature validity.",
            "Recordings and transcripts are intentionally excluded.",
            "OpenAI/Gemini realtime event evidence must come from protected runtime logs.",
        ],
    }, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
