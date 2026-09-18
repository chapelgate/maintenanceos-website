"""Runtime pilot admission guard for Chapelgate 10-call pilot.

Enforces:
- tenant chapelgate only
- max_real_calls = 10 (call 11 refused)
- owner approval recorded + Release Guardian arm (PILOT_MODE_ARMED)
- abort conditions freeze new admits
- scorecard increments on admit/complete

Does not modify voice greeting/goodbye/email notification modules.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping

from pilot.abort import evaluate_pilot_abort
from pilot.chapelgate_config import (
    MAX_REAL_CALLS,
    OWNER_APPROVAL_RECORDED,
    TENANT_ID,
    chapelgate_pilot_mode_config,
    pilot_armed,
)
from pilot.scorecard import PilotScorecard, apply_scorecard_event, empty_scorecard


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


_LOCK = threading.Lock()
_STATE = PilotRuntimeState()


def reset_pilot_runtime_for_tests() -> None:
    global _STATE
    with _LOCK:
        _STATE = PilotRuntimeState()


def _state() -> PilotRuntimeState:
    return _STATE


def is_pilot_mode_armed() -> bool:
    return pilot_armed()


def evaluate_signals_and_maybe_abort(signals: Mapping[str, Any] | None) -> dict[str, Any]:
    """Apply abort evaluation; if triggered, freeze further pilot admits."""
    result = evaluate_pilot_abort(signals)
    if result.get("abort"):
        with _LOCK:
            _STATE.aborted = True
            _STATE.abort_reason = str(result.get("reason_code") or "abort")
            _STATE.last_event_at = _utcnow()
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
        # When not armed, do not enforce pilot limit (pass-through for non-pilot runtime).
        return {
            "admitted": True,
            "pilot_enforced": False,
            "reason": "pilot_not_armed_passthrough",
            "calls_completed": _state().calls_completed,
        }

    # Armed: Chapelgate tenant only. Cross-tenant aborts the pilot.
    if tid != TENANT_ID:
        evaluate_signals_and_maybe_abort(
            {"tenant_id": tid, "cross_tenant_leakage": True}
        )
        raise PilotAdmitRejected("cross_tenant_leakage")

    with _LOCK:
        if _STATE.aborted:
            raise PilotAdmitRejected(f"pilot_aborted:{_STATE.abort_reason or 'abort'}")
        if _STATE.calls_completed >= MAX_REAL_CALLS:
            raise PilotAdmitRejected("pilot_call_limit_reached")
        # Also refuse if already admitted 10 without completions (hard ceiling).
        if _STATE.calls_admitted >= MAX_REAL_CALLS:
            raise PilotAdmitRejected("pilot_call_limit_reached")
        _STATE.calls_admitted += 1
        apply_scorecard_event(
            _STATE.scorecard,
            {"kind": "call_answered", "latency_ms": 0},
        )
        _STATE.last_event_at = _utcnow()
        return {
            "admitted": True,
            "pilot_enforced": True,
            "reason": "ok",
            "call_sid": call_sid,
            "calls_admitted": _STATE.calls_admitted,
            "calls_completed": _STATE.calls_completed,
            "max_real_calls": MAX_REAL_CALLS,
        }


def record_pilot_call_completed(*, success: bool = True) -> dict[str, Any]:
    with _LOCK:
        _STATE.calls_completed += 1
        if success:
            apply_scorecard_event(_STATE.scorecard, {"kind": "conversation_success"})
        else:
            apply_scorecard_event(_STATE.scorecard, {"kind": "call_failed"})
        _STATE.last_event_at = _utcnow()
        return {
            "calls_completed": _STATE.calls_completed,
            "max_real_calls": MAX_REAL_CALLS,
            "limit_reached": _STATE.calls_completed >= MAX_REAL_CALLS,
        }


def pilot_status() -> dict[str, Any]:
    cfg = chapelgate_pilot_mode_config()
    with _LOCK:
        return {
            "pilot_name": cfg["pilot_name"],
            "tenant": TENANT_ID,
            "armed": bool(cfg["enabled"]),
            "owner_approval_recorded": bool(cfg["owner_approval_recorded"]),
            "release_guardian_armed": bool(cfg["release_guardian_armed"]),
            "max_real_calls": MAX_REAL_CALLS,
            "calls_completed": _STATE.calls_completed,
            "calls_admitted": _STATE.calls_admitted,
            "abort_logic_active": True,
            "aborted": _STATE.aborted,
            "abort_reason": _STATE.abort_reason,
            "scorecard_active": True,
            "scorecard": _STATE.scorecard.to_dict(),
            "main_number_changed": False,
            "healthcare_regulatory_enablement": False,
            "last_event_at": _STATE.last_event_at,
        }
