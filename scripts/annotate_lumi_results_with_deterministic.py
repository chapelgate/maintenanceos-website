#!/usr/bin/env python3
"""Overlay current MaintenanceOS deterministic safety decisions onto model results.

CPU-only. Uses the canonical decision_engine.classify function from current code.
This keeps the final SUT score faithful to the production architecture:
model + deterministic safety layer, while preserving model-only miss metrics.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from decision_engine import classify
from voice_policy import FALSE_FINANCIAL_CONFIRMATION, detect_action_claims


def read_records(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".jsonl":
        return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        raise ValueError("expected JSON list or JSONL")
    return value


def annotate(cases: list[dict[str, Any]], results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id = {str(c["id"]): c for c in cases}
    out: list[dict[str, Any]] = []
    for row in results:
        sid = str(row.get("scenario_id") or "")
        case = by_id.get(sid)
        if case is None:
            raise ValueError(f"result references unknown scenario_id {sid}")
        text = "\n".join(case.get("input", {}).get("turns") or [])
        det = classify(text)
        det_hazards = sorted(
            str(x.get("code"))
            for x in (det.get("safety_flags") or [])
            if isinstance(x, dict) and x.get("code")
        )
        det_escalated = bool(det_hazards or det.get("human_review_required"))
        model_hazards = {
            str(x) for x in (row.get("hazard_codes") or [])
            if isinstance(x, str) and x
        }
        integrated_hazards = sorted(model_hazards | set(det_hazards))
        integrated_escalated = bool(row.get("escalated") is True or det_escalated)

        response_text = str(row.get("response_text") or "")
        observed_actions = sorted(detect_action_claims(response_text))
        policy_violations = []
        if observed_actions:
            policy_violations.append("unverified_action_confirmation:" + ",".join(observed_actions))
        if FALSE_FINANCIAL_CONFIRMATION.search(response_text):
            policy_violations.append("prohibited_financial_confirmation")

        claim_map = {
            "contractor_dispatched": "engineer_dispatched",
            "appointment_booked": "booking_confirmed",
            "repair_completed": "case_completed",
        }
        merged_claims = {
            str(x) for x in (row.get("claims") or [])
            if isinstance(x, str) and x
        }
        merged_claims.update(claim_map[x] for x in observed_actions if x in claim_map)

        enriched = dict(row)
        enriched.update({
            "deterministic_escalated": det_escalated,
            "deterministic_hazard_codes": det_hazards,
            "integrated_escalated": integrated_escalated,
            "integrated_hazard_codes": integrated_hazards,
            "claims": sorted(merged_claims),
            "observed_action_claims": observed_actions,
            "policy_violation_reason": ";".join(policy_violations),
        })
        out.append(enriched)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cases", type=Path)
    ap.add_argument("results", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    args = ap.parse_args()
    enriched = annotate(read_records(args.cases), read_records(args.results))
    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as fh:
        for row in enriched:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
    print(json.dumps({"rows": len(enriched), "out": str(args.out)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
