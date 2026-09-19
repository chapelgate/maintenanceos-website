"""Runtime pilot admission guard for the Chapelgate 10-call pilot.

Enforces:
- tenant chapelgate only
- max_real_calls = 10 (call 11 refused)
- owner approval recorded + Release Guardian arm (PILOT_MODE_ARMED)
- abort conditions freeze new admits
- scorecard increments on admit/complete
- pilot state persists in RuntimeControl AND a small durable JSON mirror so
  ephemeral SQLite/local filesystem redeploys cannot silently reset the
  10-call ceiling below the owner-verified floor.
"""

from __future__ import annotations

import json
import os
import threading
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Mapping

from clock import utcnow
from models import RuntimeControl, SessionLocal
from pilot.abort import evaluate_pilot_abort
from pilot.chapelgate_config import (
    MAX_REAL_CALLS,
    OWNER_APPROVAL_RECORDED,
    TENANT_ID,
    chapelgate_pilot_mode_config,
    pilot_armed,
)
from pilot.scorecard import PilotScorecard, apply_scorecard_event, empty_scorecard


PERSIST_KEY = "CHAPELGATE_10_CALL_PILOT_STATE"
_LOCK = threading.Lock()
# Owner-verified real calls already completed before durable mirror existed.
# Env PILOT_BOOTSTRAP_CALLS may raise this further; it must never lower it.
_OWNER_VERIFIED_FLOOR = 3


class PilotAdmitRejected(RuntimeError):
    def __init__(self, reason: str) -> None:
        self.reason = reason
        super().__init__(reason)


def _utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


@dataclass
class PilotRuntimeState:
    calls_completed: int = 0
    calls_admitted: int = 0
    aborted: bool = False
    abort_reason: str | None = None
    scorecard: PilotScorecard = field(default_factory=empty_scorecard)
    last_event_at: str = field(default_factory=_utcnow)


def _bootstrap_count() -> int:
    """Durable floor for owner-verified calls.

    Production default is 3 (Calls 1–3 already completed). Explicit
    PILOT_BOOTSTRAP_CALLS=0 is allowed for tests only. Any other env value
    may raise the floor but must never lower it below the owner-verified count.
    """
    raw = os.getenv("PILOT_BOOTSTRAP_CALLS", "").strip()
    if raw == "0":
        return 0
    if raw == "":
        return _OWNER_VERIFIED_FLOOR
    try:
        value = int(raw)
    except (TypeError, ValueError):
        value = _OWNER_VERIFIED_FLOOR
    return max(_OWNER_VERIFIED_FLOOR, min(value, MAX_REAL_CALLS))


def _db_backend_kind() -> str:
    url = (os.getenv("DATABASE_URL") or "").strip().lower()
    if url.startswith(("postgresql://", "postgresql+psycopg://", "postgres://")):
        return "postgres"
    if url.startswith("sqlite"):
        return "sqlite"
    if not url:
        return "sqlite_default"
    return "other"


def _state_file_path() -> Path:
    configured = (os.getenv("PILOT_STATE_PATH") or "").strip()
    if configured:
        return Path(configured)
    # Prefer Render persistent disk when present; else writable /tmp mirror;
    # else local .pilot_state under the app directory.
    for candidate in (
        Path("/var/data/chapelgate_pilot_state.json"),
        Path("/data/chapelgate_pilot_state.json"),
        Path("/tmp/chapelgate_pilot_state.json"),
    ):
        if candidate.parent.exists():
            return candidate
    return Path(os.getenv("PILOT_STATE_FALLBACK_DIR", ".")).resolve() / ".pilot_state" / "chapelgate_pilot_state.json"


def _scorecard_from_payload(payload: Mapping[str, Any] | None) -> PilotScorecard:
    raw = dict(payload or {})
    allowed = set(PilotScorecard.__dataclass_fields__.keys())
    values = {key: raw[key] for key in allowed if key in raw}
    try:
        return PilotScorecard(**values)
    except Exception:
        return empty_scorecard()


def _encode_state(state: PilotRuntimeState) -> str:
    return json.dumps(
        {
            "calls_completed": int(state.calls_completed),
            "calls_admitted": int(state.calls_admitted),
            "aborted": bool(state.aborted),
            "abort_reason": state.abort_reason,
            "scorecard": asdict(state.scorecard),
            "last_event_at": state.last_event_at,
        },
        sort_keys=True,
        separators=(",", ":"),
    )


def _decode_state(value: str) -> PilotRuntimeState:
    try:
        raw = json.loads(value or "{}")
    except (TypeError, json.JSONDecodeError):
        raw = {}
    if not isinstance(raw, dict):
        raw = {}
    try:
        completed = max(0, int(raw.get("calls_completed", 0)))
        admitted = max(0, int(raw.get("calls_admitted", 0)))
    except (TypeError, ValueError):
        completed = admitted = 0
    return PilotRuntimeState(
        calls_completed=completed,
        calls_admitted=admitted,
        aborted=bool(raw.get("aborted", False)),
        abort_reason=(str(raw.get("abort_reason")) if raw.get("abort_reason") else None),
        scorecard=_scorecard_from_payload(raw.get("scorecard")),
        last_event_at=str(raw.get("last_event_at") or _utcnow()),
    )


def _read_file_state() -> PilotRuntimeState | None:
    path = _state_file_path()
    try:
        if not path.is_file():
            return None
        return _decode_state(path.read_text(encoding="utf-8"))
    except OSError:
        return None


def _write_file_state(state: PilotRuntimeState) -> bool:
    path = _state_file_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        payload = _encode_state(state)
        tmp.write_text(payload, encoding="utf-8")
        tmp.replace(path)
        return True
    except OSError:
        return False


def _apply_floor(state: PilotRuntimeState) -> PilotRuntimeState:
    """Never allow persisted/ephemeral state below the owner-verified floor."""
    floor = _bootstrap_count()
    file_state = _read_file_state()
    file_completed = file_state.calls_completed if file_state else 0
    file_admitted = file_state.calls_admitted if file_state else 0
    completed = max(int(state.calls_completed), file_completed, floor)
    admitted = max(int(state.calls_admitted), file_admitted, completed, floor)
    if completed > state.calls_completed or admitted > state.calls_admitted:
        state.calls_completed = completed
        state.calls_admitted = admitted
        if state.scorecard.calls_answered < completed:
            state.scorecard.calls_answered = completed
        if state.scorecard.successful_conversations < completed:
            state.scorecard.successful_conversations = completed
        if state.scorecard.latency_samples < completed:
            state.scorecard.latency_samples = completed
        state.scorecard.updated_at = _utcnow()
        state.last_event_at = _utcnow()
    return state


def _load_state(session, *, for_update: bool) -> tuple[PilotRuntimeState, RuntimeControl]:
    query = session.query(RuntimeControl).filter_by(key=PERSIST_KEY)
    if for_update:
        query = query.with_for_update()
    control = query.one_or_none()
    if control is None:
        state = _apply_floor(PilotRuntimeState())
        control = RuntimeControl(
            key=PERSIST_KEY,
            enabled=True,
            updated_by="pilot_guard",
            reason=_encode_state(state),
        )
        session.add(control)
        session.flush()
        _write_file_state(state)
        return state, control
    state = _apply_floor(_decode_state(control.reason))
    # Re-persist if floor/file raised the counters (e.g. after ephemeral DB wipe).
    encoded = _encode_state(state)
    if control.reason != encoded:
        control.reason = encoded
        control.updated_by = "pilot_guard"
        control.updated_at = utcnow()
        session.flush()
        _write_file_state(state)
    return state, control


def _save_state(session, control: RuntimeControl, state: PilotRuntimeState) -> None:
    state = _apply_floor(state)
    control.enabled = True
    control.updated_by = "pilot_guard"
    control.updated_at = utcnow()
    control.reason = _encode_state(state)
    session.flush()
    _write_file_state(state)


def reset_pilot_runtime_for_tests() -> None:
    """Reset persisted pilot state. Test-only helper; not exposed as an API route."""
    with _LOCK:
        with SessionLocal() as session:
            control = session.query(RuntimeControl).filter_by(key=PERSIST_KEY).one_or_none()
            if control is not None:
                session.delete(control)
            session.commit()
        path = _state_file_path()
        with suppress_os_error():
            if path.is_file():
                path.unlink()


class suppress_os_error:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return exc_type is not None and issubclass(exc_type, OSError)


def _state() -> PilotRuntimeState:
    """Compatibility helper used by tests; state is read from durable storage."""
    with SessionLocal() as session:
        state, _ = _load_state(session, for_update=False)
        # Persist floor repairs so ephemeral empties do not keep re-bootstraping.
        session.commit()
        return state


def is_pilot_mode_armed() -> bool:
    return pilot_armed()


def evaluate_signals_and_maybe_abort(signals: Mapping[str, Any] | None) -> dict[str, Any]:
    """Apply abort evaluation; if triggered, durably freeze further pilot admits."""
    result = evaluate_pilot_abort(signals)
    if result.get("abort"):
        with _LOCK:
            with SessionLocal() as session:
                state, control = _load_state(session, for_update=True)
                state.aborted = True
                state.abort_reason = str(result.get("reason_code") or "abort")
                state.last_event_at = _utcnow()
                _save_state(session, control, state)
                session.commit()
    return result


def admit_pilot_call(
    *,
    tenant_id: str,
    call_sid: str = "",
) -> dict[str, Any]:
    """Gate a new real pilot call. Raises PilotAdmitRejected when refused."""
    tid = str(tenant_id or "").strip()

    if not OWNER_APPROVAL_RECORDED:
        raise PilotAdmitRejected("owner_approval_missing")

    if not is_pilot_mode_armed():
        return {
            "admitted": True,
            "pilot_enforced": False,
            "reason": "pilot_not_armed_passthrough",
            "calls_completed": _state().calls_completed,
        }

    if tid != TENANT_ID:
        evaluate_signals_and_maybe_abort(
            {"tenant_id": tid, "cross_tenant_leakage": True}
        )
        raise PilotAdmitRejected("cross_tenant_leakage")

    with _LOCK:
        with SessionLocal() as session:
            state, control = _load_state(session, for_update=True)
            if state.aborted:
                raise PilotAdmitRejected(f"pilot_aborted:{state.abort_reason or 'abort'}")
            if state.calls_completed >= MAX_REAL_CALLS or state.calls_admitted >= MAX_REAL_CALLS:
                raise PilotAdmitRejected("pilot_call_limit_reached")
            state.calls_admitted += 1
            apply_scorecard_event(state.scorecard, {"kind": "call_answered", "latency_ms": 0})
            state.last_event_at = _utcnow()
            _save_state(session, control, state)
            session.commit()
            return {
                "admitted": True,
                "pilot_enforced": True,
                "reason": "ok",
                "call_sid": call_sid,
                "calls_admitted": state.calls_admitted,
                "calls_completed": state.calls_completed,
                "max_real_calls": MAX_REAL_CALLS,
            }


def record_pilot_call_completed(*, success: bool = True) -> dict[str, Any]:
    with _LOCK:
        with SessionLocal() as session:
            state, control = _load_state(session, for_update=True)
            # Never let duplicate release/finalisation events push completed above admitted.
            if state.calls_completed < state.calls_admitted:
                state.calls_completed += 1
                if success:
                    apply_scorecard_event(state.scorecard, {"kind": "conversation_success"})
                else:
                    apply_scorecard_event(state.scorecard, {"kind": "call_failed"})
                state.last_event_at = _utcnow()
                _save_state(session, control, state)
                session.commit()
            else:
                # Still re-mirror floor state so redeploys keep the verified count.
                _save_state(session, control, state)
                session.commit()
            return {
                "calls_completed": state.calls_completed,
                "max_real_calls": MAX_REAL_CALLS,
                "limit_reached": state.calls_completed >= MAX_REAL_CALLS,
            }


def record_pilot_scorecard_event(kind: str, **values: Any) -> dict[str, Any]:
    """Durably record a redacted pilot scorecard event from a proven provider action."""
    if not is_pilot_mode_armed():
        return {"recorded": False, "reason": "pilot_not_armed"}
    event = {"kind": str(kind or "").strip(), **values}
    with _LOCK:
        with SessionLocal() as session:
            state, control = _load_state(session, for_update=True)
            apply_scorecard_event(state.scorecard, event)
            state.last_event_at = _utcnow()
            _save_state(session, control, state)
            session.commit()
            return {"recorded": True, "kind": event["kind"]}


def pilot_status() -> dict[str, Any]:
    cfg = chapelgate_pilot_mode_config()
    with _LOCK:
        with SessionLocal() as session:
            state, _ = _load_state(session, for_update=False)
            # Commit floor repairs so health checks heal ephemeral empties.
            session.commit()
    file_ok = _state_file_path().is_file()
    try:
        from email_gateway import email_gate_status

        email_gate = email_gate_status()
    except Exception:
        email_gate = {
            "live_email_flag": False,
            "pilot_resend_ready": False,
            "resend_key_present": False,
            "sender_configured": False,
            "recipient_configured": False,
        }
    try:
        from pilot.email_selftest import selftest_status

        email_selftest = selftest_status()
    except Exception:
        email_selftest = None
    return {
        "pilot_name": cfg["pilot_name"],
        "tenant": TENANT_ID,
        "armed": bool(cfg["enabled"]),
        "owner_approval_recorded": bool(cfg["owner_approval_recorded"]),
        "release_guardian_armed": bool(cfg["release_guardian_armed"]),
        "max_real_calls": MAX_REAL_CALLS,
        "calls_completed": state.calls_completed,
        "calls_admitted": state.calls_admitted,
        "abort_logic_active": True,
        "aborted": state.aborted,
        "abort_reason": state.abort_reason,
        "scorecard_active": True,
        "scorecard": state.scorecard.to_dict(),
        "main_number_changed": False,
        "healthcare_regulatory_enablement": False,
        "last_event_at": state.last_event_at,
        "persistence": {
            "db_backend": _db_backend_kind(),
            "file_mirror": file_ok,
            "bootstrap_floor": _bootstrap_count(),
            "ephemeral_sqlite_risk": _db_backend_kind().startswith("sqlite"),
        },
        "email_gate": email_gate,
        "email_selftest": email_selftest,
    }
