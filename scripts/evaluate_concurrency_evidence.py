#!/usr/bin/env python3
"""Independent Defender/Evaluator for concurrency-100 gates.

Re-executes the ladder (N=100) and the HTTP path probe (N=12).
Does not trust builder booleans alone. Never fabricates results.
Does not modify product code.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


REQUIRED_GATES = (
    "sim_ladder_100",
    "path_probe_12",
    "pytest_green",
    "redteam_green",
    "recovery_ok",
)


def evaluate(pack: dict, *, reexec: bool = True) -> dict:
    gates = pack.get("gates") or {}
    findings = []
    for key in REQUIRED_GATES:
        if not gates.get(key):
            findings.append(f"FAIL gate:{key}")
    if gates.get("cross_leak"):
        findings.append("FAIL cross_leak_detected")

    ladder = pack.get("ladder_summary") or []
    if not ladder or ladder[-1].get("target") != 100 or not ladder[-1].get("pass_gate"):
        findings.append("FAIL ladder_final_not_100_pass")
    if ladder and ladder[-1].get("peak", 0) < 100:
        findings.append("FAIL peak_below_100")
    if ladder and ladder[-1].get("ai_contexts_peak", 0) < 100:
        findings.append("FAIL ai_contexts_peak_below_100")
    targets = [row.get("target") for row in ladder]
    if targets != [1, 5, 12, 25, 50, 75, 100]:
        findings.append(f"FAIL ladder_targets:{targets}")
    if any(not row.get("pass_gate") for row in ladder):
        findings.append("FAIL intermediate_ladder_level")

    # Honesty: builder must not claim live media for this gate.
    if pack.get("live_media_exercised") is True:
        findings.append("FAIL overclaim_live_media_in_simulated_pack")
    scope = pack.get("gate_scope") or ""
    if scope and "mock" not in scope and "simulated" not in scope:
        findings.append(f"FAIL dishonest_gate_scope:{scope}")

    # Actions must be acknowledged: either blocked with reason, or verified green.
    ga = str(gates.get("github_actions", ""))
    if not (ga.startswith("BLOCKED") or ga.startswith("PASS")):
        findings.append("FAIL missing_actions_status_ack")

    if reexec:
        # Independent re-run of the 100-level only (fast enough, non-chargeable).
        proc = subprocess.run(
            [sys.executable, "-c", "from concurrency_loadtest import run_level; r=run_level(100); import json; print(json.dumps({'pass':r.pass_gate,'peak':r.active_calls_peak,'ai':r.ai_contexts_peak,'cross':r.cross_leak_detected,'scope':r.gate_scope}))"],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if proc.returncode != 0:
            findings.append(f"FAIL reexec_ladder:{proc.stderr[-200:]}")
        else:
            try:
                line = [ln for ln in proc.stdout.splitlines() if ln.startswith("{")][-1]
                data = json.loads(line)
                if not data.get("pass"):
                    findings.append("FAIL reexec_ladder_not_pass")
                if data.get("peak", 0) < 100 or data.get("ai", 0) < 100:
                    findings.append("FAIL reexec_peaks")
                if data.get("cross"):
                    findings.append("FAIL reexec_cross_leak")
            except Exception as exc:  # noqa: BLE001
                findings.append(f"FAIL reexec_parse:{exc}")

        path_proc = subprocess.run(
            [
                sys.executable,
                "-c",
                (
                    "from telephony_path_concurrency_probe import run_telephony_path_probe; "
                    "r=run_telephony_path_probe(12); import json; "
                    "print(json.dumps({'pass':r.pass_gate,'accepted':r.accepted,'peak':r.peak_active}))"
                ),
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
        )
        if path_proc.returncode != 0:
            findings.append(f"FAIL reexec_path_probe:{path_proc.stderr[-200:]}")
        else:
            try:
                line = [ln for ln in path_proc.stdout.splitlines() if ln.startswith("{")][-1]
                data = json.loads(line)
                if not data.get("pass") or data.get("accepted") != 12 or data.get("peak", 0) < 12:
                    findings.append("FAIL reexec_path_probe_not_pass")
            except Exception as exc:  # noqa: BLE001
                findings.append(f"FAIL reexec_path_parse:{exc}")

    verdict = "DEFENDER_PASS_SIMULATED" if not findings else "DEFENDER_FAIL"
    return {
        "verdict": verdict,
        "findings": findings,
        "builder_verdict": pack.get("verdict"),
        "sha": pack.get("final_sha"),
        "baseline": pack.get("baseline_main_sha"),
        "human_blockers": pack.get("complete_blocked_by") or [],
        "note": (
            "Simulated admission+DB+mock AI contexts only. "
            "Not live Twilio media / provider Realtime. "
            "GitHub Actions budget + N=2 live probe remain for full COMPLETE."
        ),
    }


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--no-reexec"]
    reexec = "--no-reexec" not in sys.argv
    path = Path(args[0] if args else "docs/concurrency_100_evidence/evidence-pack.json")
    if not path.exists():
        print(json.dumps({"verdict": "DEFENDER_FAIL", "findings": [f"missing:{path}"]}))
        return 1
    pack = json.loads(path.read_text())
    result = evaluate(pack, reexec=reexec)
    print(json.dumps(result, indent=2))
    out = path.parent / "defender-evaluation.json"
    out.write_text(json.dumps(result, indent=2))
    return 0 if result["verdict"].startswith("DEFENDER_PASS") else 1


if __name__ == "__main__":
    raise SystemExit(main())
