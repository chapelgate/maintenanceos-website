"""Simulated concurrency ladder for MaintenanceOS voice.

Uses mocked telephony/AI sessions only — no real Twilio or model charges.
Proves progressive concurrency: 1 → 5 → 12 → 25 → 50 → 75 → 100.
"""

from __future__ import annotations

import os
import resource
import statistics
import tempfile
import threading
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import suppress
from dataclasses import asdict, dataclass, field
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import call_capacity
import channels
import voice_bridge
from ai_session_sim import (
    active_mock_ai_sessions,
    close_mock_ai_session,
    open_mock_ai_session,
    reset_mock_ai_sessions,
)
from call_capacity import (
    CapacityRejected,
    admit_call,
    capacity_snapshot,
    expire_stale_leases,
    release_call_lease,
    reset_capacity_backend_for_tests,
)
from models import Base, CallSession, CallSessionTenant, Client, Property, TenantBoundary
from tenant_security import call_client_id


LADDER = (1, 5, 12, 25, 50, 75, 100)


@dataclass
class CallSimResult:
    index: int
    call_sid: str
    call_session_id: int | None
    client_id: int
    accepted: bool
    rejected_reason: str = ""
    session_created: bool = False
    ai_context_id: str = ""
    transcript_ok: bool = False
    isolation_ok: bool = False
    tenant_ok: bool = False
    terminated: bool = False
    connection_ms: float = 0.0
    response_ms: float = 0.0
    webhook_retries: int = 0
    network_bytes: int = 0
    duplicate_close: bool = False
    error: str = ""


@dataclass
class LadderLevelReport:
    target: int
    accepted: int
    rejected: int
    session_success: int
    isolation_pass: int
    tenant_pass: int
    terminated: int
    errors: int
    connection_latency_ms: dict[str, float]
    response_latency_ms: dict[str, float]
    cpu_user_s: float
    cpu_system_s: float
    max_rss_kb: int
    active_calls_peak: int
    ai_contexts_peak: int
    unique_ai_contexts: int
    db_sessions: int
    unique_call_ids: int
    unique_session_ids: int
    unique_transcripts: int
    call_session_tenant_rows: int
    cross_leak_detected: bool
    duplicate_actions: int
    webhook_retries: int
    estimated_network_bytes: int
    ai_session_utilisation_peak: float
    recovery_ok: bool
    estimated_cost_usd: float
    pass_gate: bool
    gate_scope: str = "simulated_admission_db_and_mock_ai_contexts"
    live_media_exercised: bool = False
    bottleneck: str = ""
    bottleneck_class: str = ""
    details: list[dict[str, Any]] = field(default_factory=list)


def _latency_stats(values: list[float]) -> dict[str, float]:
    if not values:
        return {"p50": 0.0, "p95": 0.0, "max": 0.0, "mean": 0.0}
    ordered = sorted(values)
    p95_idx = min(len(ordered) - 1, max(0, int(round(0.95 * (len(ordered) - 1)))))
    return {
        "p50": round(statistics.median(ordered), 3),
        "p95": round(ordered[p95_idx], 3),
        "max": round(ordered[-1], 3),
        "mean": round(statistics.fmean(ordered), 3),
    }


def _rss_kb() -> int:
    usage = resource.getrusage(resource.RUSAGE_SELF)
    # ru_maxrss is KB on Linux, bytes on macOS; assume Linux cloud agent.
    return int(usage.ru_maxrss)


def _estimate_cost(accepted: int) -> float:
    """Non-chargeable simulation estimate for planning only.

    Placeholder unit costs for realtime voice + media minutes; not billed here.
    """
    per_call_model = float(os.getenv("EST_COST_PER_CALL_USD", "0.08"))
    per_call_telephony = float(os.getenv("EST_COST_PER_CALL_TELEPHONY_USD", "0.02"))
    return round(accepted * (per_call_model + per_call_telephony), 4)


def _seed_tenant(factory, label: str) -> int:
    with factory() as session:
        client = Client(name=f"Concurrency tenant {label}")
        session.add(client)
        session.flush()
        session.add(Property(client_id=client.id, address=f"{label} Test Road", postcode="ZZ99 9ZZ"))
        session.add(TenantBoundary(client_id=client.id, mode="SYNTHETIC_TEST", label=label))
        session.commit()
        return client.id


def _simulate_one(
    *,
    index: int,
    client_id: int,
    factory,
    barrier: threading.Barrier | None,
    hold_seconds: float,
    marker: str,
    peak_tracker: list | None = None,
    peak_lock: threading.Lock | None = None,
) -> CallSimResult:
    call_sid = f"CA-SIM-{marker}-{index:05d}"
    started = time.perf_counter()
    result = CallSimResult(index=index, call_sid=call_sid, call_session_id=None, client_id=client_id, accepted=False)
    try:
        call_session_id = voice_bridge.create_call_session(call_sid, f"+4477009{index:05d}", client_id)
        result.call_session_id = call_session_id
        result.session_created = True
        result.connection_ms = (time.perf_counter() - started) * 1000

        t1 = time.perf_counter()
        admit_call(call_sid=call_sid, call_session_id=call_session_id, client_id=client_id)
        result.accepted = True
        result.response_ms = (time.perf_counter() - t1) * 1000

        if not voice_bridge.claim_active_call_session(call_session_id):
            raise RuntimeError("duplicate_active_media_session")
        ai = open_mock_ai_session(call_sid=call_sid, call_session_id=call_session_id, client_id=client_id)
        result.ai_context_id = ai.context_id

        unique_line = f"Caller-{index}: gate {1000 + index} repair marker {marker}-{index}"
        voice_bridge.record_transcript_segment(call_session_id, "Caller", unique_line)
        voice_bridge.record_transcript_segment(call_session_id, "Assistant", f"Ack {index} for {marker}")
        admit_call(call_sid=call_sid, call_session_id=call_session_id, client_id=client_id)
        result.webhook_retries = 1

        if barrier is not None:
            barrier.wait(timeout=max(5.0, hold_seconds * 20 + 5.0))
        if peak_tracker is not None and peak_lock is not None:
            snap = capacity_snapshot()
            with peak_lock:
                peak_tracker[0] = max(peak_tracker[0], snap.active_calls)
                peak_tracker[1] = max(peak_tracker[1], snap.ai_session_utilisation)
                peak_tracker[2] = max(peak_tracker[2], active_mock_ai_sessions())
                peak_tracker[3] = max(peak_tracker[3], voice_bridge.active_call_session_count())
        time.sleep(hold_seconds)

        with factory() as session:
            cs = session.get(CallSession, call_session_id)
            bound = call_client_id(session, call_session_id)
            result.tenant_ok = bound == client_id
            text_body = cs.transcript if cs else ""
            result.transcript_ok = unique_line in text_body and f"Caller-{index}:" in text_body
            foreign = [
                line
                for line in (text_body or "").splitlines()
                if line.startswith("Caller-") and not line.startswith(f"Caller-{index}:")
            ]
            result.isolation_ok = result.transcript_ok and not foreign
            result.network_bytes = len((text_body or "").encode("utf-8"))

        close_mock_ai_session(call_session_id)
        voice_bridge.release_active_call_session(call_session_id)
        voice_bridge.close_call_session(call_session_id)
        voice_bridge.close_call_session(call_session_id)
        result.terminated = True
        result.duplicate_close = True
    except CapacityRejected as exc:
        result.rejected_reason = exc.reason
        if result.call_session_id:
            close_mock_ai_session(result.call_session_id)
            voice_bridge.release_active_call_session(result.call_session_id)
        release_call_lease(call_sid=call_sid, call_session_id=result.call_session_id or 0)
        if barrier is not None:
            with suppress(Exception):
                barrier.abort()
    except Exception as exc:
        result.error = f"{type(exc).__name__}:{exc}"
        if result.call_session_id:
            close_mock_ai_session(result.call_session_id)
            voice_bridge.release_active_call_session(result.call_session_id)
        release_call_lease(call_sid=call_sid, call_session_id=result.call_session_id or 0)
        if barrier is not None:
            with suppress(Exception):
                barrier.abort()
    return result



def run_level(
    target: int,
    *,
    database_url: str | None = None,
    hold_seconds: float = 0.05,
    second_tenant: bool = True,
) -> LadderLevelReport:
    reset_capacity_backend_for_tests()
    os.environ.setdefault("GLOBAL_MAX_CONCURRENT_CALLS", "100")
    os.environ.setdefault("PER_CLIENT_MAX_CONCURRENT_CALLS", "100")

    tmp_path = None
    if database_url:
        engine = create_engine(database_url)
    else:
        # File SQLite with timeout: StaticPool + threads corrupts session identity.
        fd, tmp_path = tempfile.mkstemp(prefix="mos-concurrency-", suffix=".db")
        os.close(fd)
        engine = create_engine(
            f"sqlite:///{tmp_path}",
            connect_args={"check_same_thread": False, "timeout": 30},
        )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    voice_bridge.SessionLocal = factory
    channels.SessionLocal = factory
    voice_bridge._ACTIVE_CALL_SESSIONS.clear()
    reset_mock_ai_sessions()

    marker = f"L{target}-{int(time.time())}"
    primary = _seed_tenant(factory, f"{marker}-A")
    secondary = _seed_tenant(factory, f"{marker}-B") if second_tenant else primary
    barrier = threading.Barrier(target)

    cpu_before = resource.getrusage(resource.RUSAGE_SELF)
    # [0]=leases, [1]=util, [2]=mock AI contexts, [3]=media claims
    peak_tracker = [0, 0.0, 0, 0]
    peak_lock = threading.Lock()
    results: list[CallSimResult] = []

    def wrapped(i: int) -> CallSimResult:
        client_id = primary if i % 5 else secondary  # mostly one company, some mix
        return _simulate_one(
            index=i,
            client_id=client_id,
            factory=factory,
            barrier=barrier,
            hold_seconds=hold_seconds,
            marker=marker,
            peak_tracker=peak_tracker,
            peak_lock=peak_lock,
        )

    with ThreadPoolExecutor(max_workers=min(target, 100)) as pool:
        futures = [pool.submit(wrapped, i) for i in range(target)]
        for fut in as_completed(futures):
            results.append(fut.result())

    peak_active = int(peak_tracker[0])
    peak_util = float(peak_tracker[1])
    peak_ai = int(peak_tracker[2])
    peak_media = int(peak_tracker[3])

    # Recovery probe: inject a stale orphan lease, expire it, ensure capacity clears
    # without disturbing the already-terminated cohort.
    orphan = admit_call(call_sid=f"CA-ORPHAN-{marker}", call_session_id=9_000_000 + target, client_id=primary)
    # Backdate acquisition so expire_stale treats it as dead-worker debris.
    orphan.acquired_at = orphan.acquired_at - 10_000
    capacity_backend = call_capacity.capacity_backend()
    with capacity_backend._lock:
        capacity_backend._leases[orphan.lease_id] = orphan
    removed = expire_stale_leases(max_age_seconds=1.0)
    recovery_ok = removed >= 1 and capacity_snapshot().active_calls == 0

    cpu_after = resource.getrusage(resource.RUSAGE_SELF)
    accepted = [r for r in results if r.accepted]
    rejected = [r for r in results if not r.accepted and not r.error]
    errored = [r for r in results if r.error]

    with factory() as session:
        sessions = session.query(CallSession).all()
        transcripts = [cs.transcript for cs in sessions]
        session_ids = {cs.id for cs in sessions}
        call_ids = {cs.call_sid for cs in sessions}
        tenant_rows = session.query(CallSessionTenant).count()
        # Cross-leak: a transcript containing another caller's unique marker
        cross = False
        for cs in sessions:
            for other in sessions:
                if other.id == cs.id:
                    continue
                marker_line = f"Caller-{int(other.call_sid.split('-')[-1])}:"
                if marker_line in (cs.transcript or ""):
                    cross = True
                    break
            if cross:
                break

    conn_stats = _latency_stats([r.connection_ms for r in accepted])
    resp_stats = _latency_stats([r.response_ms for r in accepted])
    network_bytes = sum(r.network_bytes for r in accepted)
    webhook_retries = sum(r.webhook_retries for r in accepted)
    # Duplicate close attempted once per accepted call; count failures only.
    duplicate_actions = sum(1 for r in accepted if r.duplicate_close and not r.terminated)

    ai_context_ids = {r.ai_context_id for r in accepted if r.ai_context_id}

    # Gate: admission + DB isolation + mock AI contexts simultaneously active.
    # Explicitly does NOT claim live Twilio media or provider Realtime sockets.
    pass_gate = (
        len(accepted) == target
        and len(errored) == 0
        and len(call_ids) == target
        and len(session_ids) == target
        and len({t for t in transcripts if t}) == target
        and tenant_rows == target
        and not cross
        and peak_active >= target
        and peak_ai >= target
        and peak_media >= target
        and len(ai_context_ids) == target
        and recovery_ok
        and all(r.isolation_ok and r.tenant_ok and r.terminated and r.ai_context_id for r in accepted)
    )

    bottleneck = ""
    bottleneck_class = ""
    if not pass_gate:
        if any(r.rejected_reason == "global_capacity" for r in results):
            bottleneck = "application_capacity_limit"
            bottleneck_class = "application_architecture"
        elif any(r.rejected_reason == "client_capacity" for r in results):
            bottleneck = "per_company_capacity_limit"
            bottleneck_class = "application_architecture"
        elif not recovery_ok:
            bottleneck = "lease_recovery"
            bottleneck_class = "application_architecture"
        elif errored:
            sample = errored[0].error
            if "database" in sample.lower() or "sqlite" in sample.lower() or "OperationalError" in sample:
                bottleneck = "database"
                bottleneck_class = "database"
            elif "timeout" in sample.lower():
                bottleneck = "timeouts"
                bottleneck_class = "networking"
            else:
                bottleneck = f"application_error:{sample[:80]}"
                bottleneck_class = "application_architecture"
        elif cross:
            bottleneck = "session_isolation"
            bottleneck_class = "application_architecture"
        else:
            bottleneck = "incomplete_acceptance_gate"
            bottleneck_class = "application_architecture"
    else:
        # Even on PASS, classify the likely next external limiter for operators.
        bottleneck_class = "provider_quota_next"
        bottleneck = "none_app_layer_cleared_check_twilio_gemini_quotas"

    report = LadderLevelReport(
        target=target,
        accepted=len(accepted),
        rejected=len(rejected),
        session_success=sum(1 for r in results if r.session_created),
        isolation_pass=sum(1 for r in accepted if r.isolation_ok),
        tenant_pass=sum(1 for r in accepted if r.tenant_ok),
        terminated=sum(1 for r in results if r.terminated),
        errors=len(errored),
        connection_latency_ms=conn_stats,
        response_latency_ms=resp_stats,
        cpu_user_s=round(cpu_after.ru_utime - cpu_before.ru_utime, 4),
        cpu_system_s=round(cpu_after.ru_stime - cpu_before.ru_stime, 4),
        max_rss_kb=_rss_kb(),
        active_calls_peak=peak_active,
        ai_contexts_peak=peak_ai,
        unique_ai_contexts=len(ai_context_ids),
        db_sessions=len(sessions),
        unique_call_ids=len(call_ids),
        unique_session_ids=len(session_ids),
        unique_transcripts=len({t for t in transcripts if t}),
        call_session_tenant_rows=tenant_rows,
        cross_leak_detected=cross,
        duplicate_actions=duplicate_actions,
        webhook_retries=webhook_retries,
        estimated_network_bytes=network_bytes,
        ai_session_utilisation_peak=round(peak_util, 4),
        recovery_ok=recovery_ok,
        estimated_cost_usd=_estimate_cost(len(accepted)),
        pass_gate=pass_gate,
        gate_scope="simulated_admission_db_and_mock_ai_contexts",
        live_media_exercised=False,
        bottleneck=bottleneck,
        bottleneck_class=bottleneck_class,
        details=[asdict(r) for r in sorted(results, key=lambda item: item.index)],
    )
    if tmp_path:
        try:
            engine.dispose()
            os.unlink(tmp_path)
        except OSError:
            pass
    return report


def run_ladder(levels: tuple[int, ...] = LADDER, **kwargs) -> list[LadderLevelReport]:
    reports = []
    for level in levels:
        report = run_level(level, **kwargs)
        reports.append(report)
        if not report.pass_gate:
            break
    return reports


def main() -> int:
    import json
    from pathlib import Path

    out_dir = Path(os.getenv("CONCURRENCY_EVIDENCE_DIR", "/tmp/concurrency-ladder-evidence"))
    out_dir.mkdir(parents=True, exist_ok=True)
    reports = run_ladder()
    payload = [asdict(r) for r in reports]
    # Trim per-call details in summary file size for large runs
    for item in payload:
        if item["target"] >= 25:
            item["details"] = item["details"][:5] + [{"truncated": True, "total": item["target"]}]
    path = out_dir / "ladder-report.json"
    path.write_text(json.dumps(payload, indent=2))
    print(f"WROTE {path}")
    for report in reports:
        status = "PASS" if report.pass_gate else "FAIL"
        print(
            f"LEVEL {report.target}: {status} accepted={report.accepted}/{report.target} "
            f"peak_active={report.active_calls_peak} peak_ai={report.ai_contexts_peak} "
            f"p95_conn_ms={report.connection_latency_ms['p95']} "
            f"scope={report.gate_scope} bottleneck={report.bottleneck or 'none'}"
        )
    return 0 if reports and reports[-1].pass_gate and reports[-1].target == max(LADDER) else 1


if __name__ == "__main__":
    raise SystemExit(main())
