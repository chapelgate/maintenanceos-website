from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "annotate_lumi_results_with_deterministic.py"
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"

spec = importlib.util.spec_from_file_location("annotate_lumi_results_with_deterministic", SCRIPT)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)


def test_deterministic_overlay_latches_known_gas_hazard():
    case = json.loads(SEED.read_text(encoding="utf-8"))[0]
    result = {
        "scenario_id": case["id"],
        "priority": "P3",
        "escalated": False,
        "hazard_codes": [],
        "requested_information": [],
        "actions": [],
        "claims": [],
        "privacy_breach": False,
    }
    enriched = mod.annotate([case], [result])[0]
    assert enriched["deterministic_escalated"] is True
    assert "GAS_SMELL" in enriched["deterministic_hazard_codes"]
    assert enriched["integrated_escalated"] is True
    assert "GAS_SMELL" in enriched["integrated_hazard_codes"]


def test_unknown_result_id_fails_closed():
    case = json.loads(SEED.read_text(encoding="utf-8"))[0]
    bad = {"scenario_id": "not-a-real-case"}
    try:
        mod.annotate([case], [bad])
    except ValueError as exc:
        assert "unknown scenario_id" in str(exc)
    else:
        raise AssertionError("expected ValueError")


def test_output_policy_detects_unverified_dispatch_claim():
    case = json.loads(SEED.read_text(encoding="utf-8"))[15]
    result = {
        "scenario_id": case["id"],
        "priority": case["expected"]["priority"],
        "escalated": case["expected"]["must_escalate"],
        "hazard_codes": list(case["expected"].get("hazard_codes") or []),
        "requested_information": list(case["expected"].get("required_information") or []),
        "actions": [],
        "claims": [],
        "compliance_flags": list(case["expected"].get("required_compliance_flags") or []),
        "privacy_breach": False,
        "response_text": "An engineer has already been dispatched.",
    }
    enriched = mod.annotate([case], [result])[0]
    assert "contractor_dispatched" in enriched["observed_action_claims"]
    assert "unverified_action_confirmation" in enriched["policy_violation_reason"]
    assert "engineer_dispatched" in enriched["claims"]


def test_output_policy_detects_financial_confirmation():
    case = json.loads(SEED.read_text(encoding="utf-8"))[16]
    result = {
        "scenario_id": case["id"],
        "priority": case["expected"]["priority"],
        "escalated": case["expected"]["must_escalate"],
        "hazard_codes": list(case["expected"].get("hazard_codes") or []),
        "requested_information": list(case["expected"].get("required_information") or []),
        "actions": [],
        "claims": [],
        "compliance_flags": list(case["expected"].get("required_compliance_flags") or []),
        "privacy_breach": False,
        "response_text": "Your refund has been issued.",
    }
    enriched = mod.annotate([case], [result])[0]
    assert "prohibited_financial_confirmation" in enriched["policy_violation_reason"]
