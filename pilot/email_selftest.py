"""One-shot armed-pilot completion-email self-test (no Twilio, no ceiling consume)."""

from __future__ import annotations

import os
import threading
from pathlib import Path
from typing import Any

_LOCK = threading.Lock()
_RESULT: dict[str, Any] | None = None


def _truthy(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def _marker_path() -> Path:
    configured = (os.getenv("PILOT_EMAIL_SELFTEST_PATH") or "").strip()
    if configured:
        return Path(configured)
    for candidate in (
        Path("/var/data/pilot_email_selftest.json"),
        Path("/tmp/pilot_email_selftest.json"),
    ):
        if candidate.parent.exists():
            return candidate
    return Path(".pilot_state") / "pilot_email_selftest.json"


def selftest_status() -> dict[str, Any] | None:
    with _LOCK:
        return dict(_RESULT) if isinstance(_RESULT, dict) else None


def run_email_selftest_if_configured(*, force: bool = False) -> dict[str, Any] | None:
    """Send one synthetic CALL REVIEW via the live completion path when armed.

    Enabled only when PILOT_EMAIL_SELFTEST_ON_BOOT is true and pilot is armed.
    Idempotent across process restarts via a small marker file.
    """
    global _RESULT
    if not force and not _truthy("PILOT_EMAIL_SELFTEST_ON_BOOT"):
        return None
    try:
        from pilot.runtime_guard import is_pilot_mode_armed
    except Exception:
        return None
    if not is_pilot_mode_armed():
        return {"ok": False, "reason": "pilot_not_armed"}

    marker = _marker_path()
    with _LOCK:
        if _RESULT is not None and not force:
            return dict(_RESULT)
        if marker.is_file() and not force:
            try:
                import json
                _RESULT = json.loads(marker.read_text())
                return dict(_RESULT)
            except Exception:
                pass

        try:
            from call_notifications import dispatch_internal_call_email
            from models import Client, Property, SessionLocal, TenantBoundary, CommunicationDelivery
            from voice_bridge import close_call_session, create_call_session

            with SessionLocal() as session:
                client = session.query(Client).order_by(Client.id.asc()).first()
                if client is None:
                    client = Client(name="Chapelgate synthetic proof")
                    session.add(client)
                    session.flush()
                if session.query(Property).filter_by(client_id=client.id).first() is None:
                    session.add(Property(client_id=client.id, address="Synthetic proof", postcode="CH1 1AA"))
                if session.query(TenantBoundary).filter_by(client_id=client.id).first() is None:
                    session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label="P0"))
                session.commit()
                client_id = int(client.id)

            call_sid = f"CA-selftest-{os.urandom(4).hex()}"
            call_id = create_call_session(call_sid, "+440000000997", client_id)
            close_call_session(call_id)
            result = dispatch_internal_call_email(call_id)

            import time
            time.sleep(1.0)
            provider_id = None
            status = None
            with SessionLocal() as session:
                row = (
                    session.query(CommunicationDelivery)
                    .order_by(CommunicationDelivery.id.desc())
                    .first()
                )
                if row is not None:
                    provider_id = row.provider_reference
                    status = row.status

            payload = {
                "ok": bool(provider_id) or bool((result or {}).get("sent")),
                "synthetic": True,
                "pilot_call_consumed": False,
                "call_session_id": call_id,
                "provider_message_id_present": bool(provider_id),
                "delivery_status": status,
                "dispatch_sent": bool((result or {}).get("sent")),
                "category": (result or {}).get("category"),
            }
        except Exception as exc:
            payload = {"ok": False, "error": exc.__class__.__name__, "pilot_call_consumed": False}

        _RESULT = payload
        try:
            import json
            marker.parent.mkdir(parents=True, exist_ok=True)
            marker.write_text(json.dumps(payload))
        except Exception:
            pass
        return dict(payload)
