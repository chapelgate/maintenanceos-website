"""HTTP telephony-path concurrency probe (no real Twilio / model charges).

Exercises signed `/voice/inbound` admission under concurrent synthetic CallSids
against a real local uvicorn listener (TestClient is not thread-safe).

Smallest *real* chargeable concurrency probe (after this PASS): **2 simultaneous
live calls** on the dedicated test number. Do not run 100 chargeable calls.
"""

from __future__ import annotations

import os
import socket
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from pathlib import Path

import httpx
import uvicorn
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from twilio.request_validator import RequestValidator

import api
import channels
import decision_engine
import operations
import voice_bridge
from call_capacity import capacity_snapshot, release_call_lease, reset_capacity_backend_for_tests
from models import Base, CallSession, Client, Property, Resident, TenantBoundary


PUBLIC_BASE = "https://voice-concurrency.example.test"
PUBLIC_STREAM = "wss://voice-concurrency.example.test/voice/media-stream"
SYNTHETIC_TOKEN = "synthetic-twilio-token-for-concurrency-probe"
SYNTHETIC_ACCOUNT = "AC-synthetic-concurrency-probe"


@dataclass
class ProbeResult:
    target: int
    accepted: int
    rejected_busy: int
    errors: int
    unique_call_ids: int
    unique_session_ids: int
    peak_active: int
    p95_ms: float
    pass_gate: bool
    bottleneck_class: str


def _signature(url: str, params: dict) -> str:
    return RequestValidator(SYNTHETIC_TOKEN).compute_signature(url, params)


def _free_loopback_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def _configure_env(tenant_id: int) -> None:
    values = {
        "APP_SECRET": "s" * 64,
        "VOICE_TENANT_MODE": "isolated_test",
        "VOICE_TEST_CLIENT_ID": str(tenant_id),
        "INTERNAL_API_CLIENT_ID": str(tenant_id),
        "PUBLIC_BASE_URL": PUBLIC_BASE,
        "TWILIO_ACCOUNT_SID": SYNTHETIC_ACCOUNT,
        "TWILIO_AUTH_TOKEN": SYNTHETIC_TOKEN,
        "TWILIO_HUMAN_TRANSFER_NUMBER": "+440000000099",
        "TWILIO_PHONE_NUMBER": "+440000000098",
        "TWILIO_TEST_NUMBER_CONFIRMED": "true",
        "VERIFY_TWILIO_SIGNATURES": "true",
        "OPENAI_API_KEY": "synthetic-openai-key",
        "OPENAI_REALTIME_MODEL": "gpt-realtime-2.1",
        "OPENAI_TRANSCRIPTION_MODEL": "gpt-live-transcribe",
        "OPENAI_REALTIME_VOICE": "alloy",
        "ENABLE_REALTIME_VOICE": "true",
        "ENABLE_PUBLIC_PROVIDER_INGRESS": "true",
        "VOICE_TRANSCRIPT_GRACE_SECONDS": "0",
        "GLOBAL_MAX_CONCURRENT_CALLS": "100",
        "PER_CLIENT_MAX_CONCURRENT_CALLS": "100",
        "PUBLIC_HTTP_RATE_LIMIT_PER_MINUTE": "1000",
        "PUBLIC_WS_RATE_LIMIT_PER_MINUTE": "1000",
    }
    for key, value in values.items():
        os.environ[key] = value


def run_telephony_path_probe(target: int = 12, *, hold_seconds: float = 0.12) -> ProbeResult:
    """Admit `target` concurrent synthetic inbound calls via local uvicorn + httpx."""
    reset_capacity_backend_for_tests()

    fd, tmp_path = tempfile.mkstemp(prefix="mos-path-probe-", suffix=".db")
    os.close(fd)
    engine = create_engine(
        f"sqlite:///{tmp_path}",
        connect_args={"check_same_thread": False, "timeout": 30},
    )
    factory = sessionmaker(bind=engine, expire_on_commit=False)
    Base.metadata.create_all(engine)
    for module in (api, channels, decision_engine, operations, voice_bridge):
        module.SessionLocal = factory

    with factory() as session:
        tenant = Client(name="Telephony path probe tenant")
        session.add(tenant)
        session.flush()
        prop = Property(client_id=tenant.id, address="1 Probe Way", postcode="ZZ1 1ZZ")
        session.add(prop)
        session.flush()
        session.add(
            Resident(
                client_id=tenant.id,
                property_id=prop.id,
                name="Probe caller",
                phone="+440000000051",
                email="probe@example.test",
            )
        )
        session.add(TenantBoundary(client_id=tenant.id, mode="SYNTHETIC_TEST", label="probe"))
        session.commit()
        tenant_id = tenant.id

    _configure_env(tenant_id)
    voice_bridge._ACTIVE_CALL_SESSIONS.clear()

    port = _free_loopback_port()
    server = uvicorn.Server(
        uvicorn.Config(
            api.app,
            host="127.0.0.1",
            port=port,
            log_level="error",
            lifespan="off",
        )
    )
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    deadline = time.monotonic() + 5
    while not server.started and thread.is_alive() and time.monotonic() < deadline:
        time.sleep(0.01)
    if not server.started:
        raise RuntimeError("uvicorn failed to start for telephony path probe")

    start_barrier = threading.Barrier(target)
    hold_barrier = threading.Barrier(target)
    latencies: list[float] = []
    outcomes: list[tuple[str, int, str]] = []
    lock = threading.Lock()
    peak = [0]
    inbound_url = f"http://127.0.0.1:{port}/voice/inbound"

    def one(i: int) -> None:
        params = {
            "CallSid": f"CA-PATH-{i:05d}",
            "From": f"+4477009{i:05d}",
            "To": "+440000000098",
        }
        start_barrier.wait(timeout=30)
        started = time.perf_counter()
        response = httpx.post(
            inbound_url,
            data=params,
            headers={"X-Twilio-Signature": _signature(PUBLIC_BASE + "/voice/inbound", params)},
            timeout=15,
        )
        elapsed = (time.perf_counter() - started) * 1000
        body = response.text or ""
        with lock:
            latencies.append(elapsed)
            outcomes.append((params["CallSid"], response.status_code, body))
        hold_barrier.wait(timeout=30)
        with lock:
            peak[0] = max(peak[0], capacity_snapshot().active_calls)
        time.sleep(hold_seconds)
        with factory() as session:
            row = session.query(CallSession).filter_by(call_sid=params["CallSid"]).first()
            if row:
                release_call_lease(call_sid=params["CallSid"], call_session_id=row.id)

    try:
        with ThreadPoolExecutor(max_workers=target) as pool:
            futures = [pool.submit(one, i) for i in range(target)]
            for fut in as_completed(futures):
                fut.result()
        with factory() as session:
            rows = session.query(CallSession).all()
            db_call_ids = {r.call_sid for r in rows}
            db_session_ids = {r.id for r in rows}
    finally:
        server.should_exit = True
        thread.join(timeout=5)
        engine.dispose()
        Path(tmp_path).unlink(missing_ok=True)

    stream_accepted = sum(1 for _s, status, body in outcomes if status == 200 and PUBLIC_STREAM in body)
    busy = sum(1 for _s, status, body in outcomes if status == 200 and "busy" in body.lower())
    errors = sum(
        1
        for _s, status, body in outcomes
        if status != 200 or (status == 200 and PUBLIC_STREAM not in body and "busy" not in body.lower())
    )
    accepted_sids = {_s for _s, status, body in outcomes if status == 200 and PUBLIC_STREAM in body}

    ordered = sorted(latencies)
    p95 = ordered[min(len(ordered) - 1, max(0, int(round(0.95 * (len(ordered) - 1)))))] if ordered else 0.0

    pass_gate = (
        stream_accepted == target
        and busy == 0
        and errors == 0
        and len(accepted_sids) == target
        and len(db_call_ids) == target
        and len(db_session_ids) == target
        and peak[0] >= target
    )
    bottleneck = "none"
    if not pass_gate:
        if busy:
            bottleneck = "application_capacity_limit"
        elif errors:
            bottleneck = "application_architecture"
        elif peak[0] < target:
            bottleneck = "websocket_or_admission_overlap"
        else:
            bottleneck = "incomplete_acceptance_gate"

    return ProbeResult(
        target=target,
        accepted=stream_accepted,
        rejected_busy=busy,
        errors=errors,
        unique_call_ids=len(db_call_ids),
        unique_session_ids=len(db_session_ids),
        peak_active=peak[0],
        p95_ms=round(p95, 3),
        pass_gate=pass_gate,
        bottleneck_class=bottleneck,
    )


def main() -> int:
    import json

    levels = (1, 5, 12)
    out = Path(os.getenv("CONCURRENCY_EVIDENCE_DIR", "/tmp/concurrency-ladder-evidence"))
    out.mkdir(parents=True, exist_ok=True)
    reports = []
    for level in levels:
        report = run_telephony_path_probe(level)
        reports.append(asdict(report))
        status = "PASS" if report.pass_gate else "FAIL"
        print(
            f"PATH {level}: {status} accepted={report.accepted}/{level} "
            f"peak={report.peak_active} p95_ms={report.p95_ms} class={report.bottleneck_class}"
        )
        if not report.pass_gate:
            break
    (out / "telephony-path-probe.json").write_text(json.dumps(reports, indent=2))
    return 0 if reports and reports[-1]["pass_gate"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
