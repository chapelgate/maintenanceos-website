#!/usr/bin/env python3
"""Independent Defender/Evaluator for concurrency-100 gates.

Reads evidence-pack.json produced by scripts/build_concurrency_evidence_pack.py.
Does not modify product code. Exit 0 only when simulated acceptance gates PASS
and evidence is internally consistent. Never fabricates results.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path


REQUIRED_GATES = (
    "sim_ladder_100",
    "path_probe_12",
    "pytest_green",
    "redteam_green",
    "recovery_ok",
)


def evaluate(pack: dict) -> dict:
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
    # Levels must be progressive without early abort
    targets = [row.get("target") for row in ladder]
    if targets != [1, 5, 12, 25, 50, 75, 100]:
        findings.append(f"FAIL ladder_targets:{targets}")
    if any(not row.get("pass_gate") for row in ladder):
        findings.append("FAIL intermediate_ladder_level")

    verdict = "DEFENDER_PASS_SIMULATED" if not findings else "DEFENDER_FAIL"
    return {
        "verdict": verdict,
        "findings": findings,
        "builder_verdict": pack.get("verdict"),
        "sha": pack.get("final_sha"),
        "baseline": pack.get("baseline_main_sha"),
        "human_blockers": pack.get("complete_blocked_by") or [],
        "note": "Simulated acceptance only; GitHub Actions + N=2 live probe remain for full COMPLETE",
    }


def main() -> int:
    path = Path(sys.argv[1] if len(sys.argv) > 1 else "docs/concurrency_100_evidence/evidence-pack.json")
    if not path.exists():
        print(json.dumps({"verdict": "DEFENDER_FAIL", "findings": [f"missing:{path}"]}))
        return 1
    pack = json.loads(path.read_text())
    result = evaluate(pack)
    print(json.dumps(result, indent=2))
    out = path.parent / "defender-evaluation.json"
    out.write_text(json.dumps(result, indent=2))
    return 0 if result["verdict"].startswith("DEFENDER_PASS") else 1


if __name__ == "__main__":
    raise SystemExit(main())
