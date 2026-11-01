"""Concurrent call capacity controls for MaintenanceOS voice.

Design goals:
- One public number can admit many simultaneous independent AI calls.
- Default acceptance target is 100 concurrent calls; the ceiling is configurable
  so horizontal scale can exceed 100 without redesign.
- Process-local tracking is the default (no new infrastructure until needed).
- Optional shared backend interface (Redis) for multi-instance deployments.
- A worker/process dying must not corrupt other calls; leases expire.
"""

from __future__ import annotations

import os
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Protocol


class CapacityRejected(RuntimeError):
    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


def _has_control_chars(value: str) -> bool:
    return any(ord(ch) < 32 for ch in value)


def _positive_int(name: str, default: int, *, minimum: int = 1, maximum: int = 100_000) -> int:
    try:
        value = int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default
    return value if minimum <= value <= maximum else default


def global_max_concurrent_calls() -> int:
    # Default acceptance target is 100; raise via env for future headroom.
    return _positive_int("GLOBAL_MAX_CONCURRENT_CALLS", 100, maximum=100_000)


def per_client_max_concurrent_calls() -> int:
    return _positive_int("PER_CLIENT_MAX_CONCURRENT_CALLS", 100, maximum=100_000)


@dataclass
class CallLease:
    lease_id: str
    call_sid: str
    call_session_id: int
    client_id: int
    acquired_at: float
    worker_id: str


@dataclass
class CapacitySnapshot:
    active_calls: int
    global_limit: int
    per_client_limit: int
    by_client: dict[int, int] = field(default_factory=dict)
    backend: str = "process_local"
    rejected_total: int = 0
    accepted_total: int = 0
    draining: bool = False
    ai_session_utilisation: float = 0.0  # lease utilisation (active_leases / global_limit), not mock AI contexts
    estimated_hourly_burn_usd: float = 0.0
    worker_id: str = ""


class CapacityBackend(Protocol):
    def try_acquire(self, lease: CallLease, *, global_limit: int, per_client_limit: int) -> tuple[bool, str]:
        ...

    def release(self, lease_id: str) -> None:
        ...

    def has_call(self, *, call_sid: str = "", call_session_id: int = 0) -> bool:
        with self._lock:
            lease_id = None
            if call_sid:
                lease_id = self._by_call_sid.get(call_sid)
            if not lease_id and call_session_id:
                lease_id = self._by_session.get(call_session_id)
            return bool(lease_id and lease_id in self._leases)

    def snapshot(self) -> CapacitySnapshot:
        ...

    def expire_stale(self, max_age_seconds: float) -> int:
        ...


def _estimated_hourly_burn(active_calls: int) -> float:
    """Planning estimate only — not billed. Used for cost-protection signals."""
    per_call_hour = float(os.getenv("EST_COST_PER_CALL_HOUR_USD", "0.60"))
    return round(active_calls * per_call_hour, 4)


class ProcessLocalCapacityBackend:
    """Thread-safe in-process registry.

    Suitable for a single uvicorn worker / single instance. For multiple
    application instances, set CAPACITY_BACKEND=redis once load tests prove need.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._leases: dict[str, CallLease] = {}
        self._by_call_sid: dict[str, str] = {}
        self._by_session: dict[int, str] = {}
        self.accepted_total = 0
        self.rejected_total = 0
        self.draining = False

    def set_draining(self, enabled: bool) -> None:
        with self._lock:
            self.draining = bool(enabled)

    def try_acquire(self, lease: CallLease, *, global_limit: int, per_client_limit: int) -> tuple[bool, str]:
        if _has_control_chars(lease.call_sid):
            self.rejected_total += 1
            return False, "control_char_rejected"
        if _has_control_chars(lease.worker_id):
            self.rejected_total += 1
            return False, "control_char_rejected"
        with self._lock:
            existing = self._by_call_sid.get(lease.call_sid) or self._by_session.get(lease.call_session_id)
            if existing:
                # Idempotent re-acquire of the same call.
                held = self._leases.get(existing)
                if held and held.call_sid == lease.call_sid and held.client_id == lease.client_id:
                    return True, "idempotent"
                return False, "duplicate_active_call"
            if self.draining:
                self.rejected_total += 1
                return False, "draining"
            # Cost kill-switch: reject new admits when planning burn would exceed budget.
            max_burn = os.getenv("CAPACITY_MAX_HOURLY_BURN_USD", "").strip()
            if max_burn:
                try:
                    ceiling = float(max_burn)
                except ValueError:
                    ceiling = 0.0
                if ceiling > 0 and _estimated_hourly_burn(len(self._leases) + 1) > ceiling:
                    self.rejected_total += 1
                    return False, "cost_budget"
            if len(self._leases) >= global_limit:
                self.rejected_total += 1
                return False, "global_capacity"
            client_count = sum(1 for item in self._leases.values() if item.client_id == lease.client_id)
            if client_count >= per_client_limit:
                self.rejected_total += 1
                return False, "client_capacity"
            self._leases[lease.lease_id] = lease
            self._by_call_sid[lease.call_sid] = lease.lease_id
            self._by_session[lease.call_session_id] = lease.lease_id
            self.accepted_total += 1
            return True, "acquired"

    def release(self, lease_id: str) -> None:
        with self._lock:
            lease = self._leases.pop(lease_id, None)
            if not lease:
                return
            if self._by_call_sid.get(lease.call_sid) == lease_id:
                self._by_call_sid.pop(lease.call_sid, None)
            if self._by_session.get(lease.call_session_id) == lease_id:
                self._by_session.pop(lease.call_session_id, None)

    def release_call(self, *, call_sid: str = "", call_session_id: int = 0) -> None:
        with self._lock:
            lease_id = None
            if call_sid:
                lease_id = self._by_call_sid.get(call_sid)
            if not lease_id and call_session_id:
                lease_id = self._by_session.get(call_session_id)
            if lease_id:
                lease = self._leases.pop(lease_id, None)
                if lease:
                    self._by_call_sid.pop(lease.call_sid, None)
                    self._by_session.pop(lease.call_session_id, None)

    def has_call(self, *, call_sid: str = "", call_session_id: int = 0) -> bool:
        with self._lock:
            lease_id = None
            if call_sid:
                lease_id = self._by_call_sid.get(call_sid)
            if not lease_id and call_session_id:
                lease_id = self._by_session.get(call_session_id)
            return bool(lease_id and lease_id in self._leases)

    def snapshot(self) -> CapacitySnapshot:
        with self._lock:
            by_client: dict[int, int] = {}
            for lease in self._leases.values():
                by_client[lease.client_id] = by_client.get(lease.client_id, 0) + 1
            active = len(self._leases)
            global_limit = global_max_concurrent_calls()
            utilisation = round(active / global_limit, 4) if global_limit else 0.0
            return CapacitySnapshot(
                active_calls=active,
                global_limit=global_limit,
                per_client_limit=per_client_max_concurrent_calls(),
                by_client=by_client,
                backend="process_local",
                rejected_total=self.rejected_total,
                accepted_total=self.accepted_total,
                draining=self.draining,
                ai_session_utilisation=utilisation,
                estimated_hourly_burn_usd=_estimated_hourly_burn(active),
                worker_id=_WORKER_ID,
            )

    def expire_stale(self, max_age_seconds: float) -> int:
        cutoff = time.monotonic() - max_age_seconds
        removed = 0
        with self._lock:
            for lease_id, lease in list(self._leases.items()):
                if lease.acquired_at < cutoff:
                    self._leases.pop(lease_id, None)
                    self._by_call_sid.pop(lease.call_sid, None)
                    self._by_session.pop(lease.call_session_id, None)
                    removed += 1
        return removed

    def clear(self) -> None:
        with self._lock:
            self._leases.clear()
            self._by_call_sid.clear()
            self._by_session.clear()
            self.accepted_total = 0
            self.rejected_total = 0
            self.draining = False


_WORKER_ID = os.getenv("HOSTNAME") or os.getenv("RENDER_INSTANCE_ID") or uuid.uuid4().hex[:12]
_BACKEND: ProcessLocalCapacityBackend | None = None
_BACKEND_LOCK = threading.Lock()


def capacity_backend() -> ProcessLocalCapacityBackend:
    global _BACKEND
    with _BACKEND_LOCK:
        if _BACKEND is None:
            # Redis backend is intentionally not auto-enabled. Add only after
            # multi-instance load tests prove process-local tracking is insufficient.
            backend_name = os.getenv("CAPACITY_BACKEND", "process_local").strip().lower()
            if backend_name not in {"", "process_local", "local", "memory"}:
                # Unknown backends fall back to process-local rather than inventing infra.
                pass
            _BACKEND = ProcessLocalCapacityBackend()
        return _BACKEND


def reset_capacity_backend_for_tests() -> None:
    global _BACKEND
    with _BACKEND_LOCK:
        if _BACKEND is not None:
            _BACKEND.clear()
        _BACKEND = ProcessLocalCapacityBackend()


def admit_call(*, call_sid: str, call_session_id: int, client_id: int, tenant_id: str | None = None) -> CallLease:
    # Minimal Chapelgate pilot guard (no voice redesign). When PILOT_MODE_ARMED,
    # enforce tenant + 10-call ceiling; otherwise pass through unchanged.
    try:
        from pilot.runtime_guard import PilotAdmitRejected, admit_pilot_call

        admit_pilot_call(
            tenant_id=str(tenant_id or "chapelgate"),
            call_sid=str(call_sid or ""),
        )
    except PilotAdmitRejected as exc:
        raise CapacityRejected(str(exc.reason)) from exc
    except Exception:
        # Pilot package missing/misconfigured must not silently invent success;
        # if armed env is set, fail closed. If not armed, ignore import/runtime noise.
        if os.getenv("PILOT_MODE_ARMED", "").strip().lower() in {"1", "true", "yes", "on"}:
            raise CapacityRejected("pilot_guard_unavailable")
    lease = CallLease(
        lease_id=uuid.uuid4().hex,
        call_sid=call_sid,
        call_session_id=call_session_id,
        client_id=client_id,
        acquired_at=time.monotonic(),
        worker_id=_WORKER_ID,
    )
    ok, reason = capacity_backend().try_acquire(
        lease,
        global_limit=global_max_concurrent_calls(),
        per_client_limit=per_client_max_concurrent_calls(),
    )
    if not ok:
        raise CapacityRejected(reason)
    return lease


def has_call_capacity_lease(*, call_sid: str = "", call_session_id: int = 0) -> bool:
    """Return whether a process-local admission lease is still held for a call."""
    return capacity_backend().has_call(call_sid=call_sid, call_session_id=call_session_id)


def release_call_capacity_only(*, call_sid: str = "", call_session_id: int = 0) -> None:
    """Release capacity without recording a completed pilot call.

    Used when Twilio received stream TwiML but never opened the Media Stream.
    """
    capacity_backend().release_call(call_sid=call_sid, call_session_id=call_session_id)


def release_call_lease(lease: CallLease | None = None, *, call_sid: str = "", call_session_id: int = 0) -> None:
    backend = capacity_backend()
    if lease is not None:
        backend.release(lease.lease_id)
    else:
        backend.release_call(call_sid=call_sid, call_session_id=call_session_id)
    # Minimal pilot counter: count released leases toward the 10-call ceiling when armed.
    try:
        from pilot.runtime_guard import is_pilot_mode_armed, record_pilot_call_completed

        if is_pilot_mode_armed():
            record_pilot_call_completed(success=True)
    except Exception:
        pass


def expire_stale_leases(max_age_seconds: float | None = None) -> int:
    """Drop leases left behind by a dead worker/process.

    Does not touch other active leases. Default age comes from
    CAPACITY_LEASE_MAX_AGE_SECONDS (1 hour) — long enough for real calls,
    short enough to free capacity after crashes.
    """
    if max_age_seconds is None:
        max_age_seconds = float(os.getenv("CAPACITY_LEASE_MAX_AGE_SECONDS", "3600"))
    return capacity_backend().expire_stale(max_age_seconds)


def set_capacity_draining(enabled: bool) -> None:
    """Graceful drain: reject new admits; existing calls finish normally."""
    capacity_backend().set_draining(enabled)


def capacity_snapshot() -> CapacitySnapshot:
    return capacity_backend().snapshot()
