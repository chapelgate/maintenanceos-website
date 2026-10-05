from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "score_lumi_benchmark_v2.py"
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"

spec = importlib.util.spec_from_file_location("score_lumi_benchmark_v2", SCRIPT)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)


def seed_case(i=0):
    return json.loads(SEED.read_text(encoding="utf-8"))[i]


def good_actual(case):
    exp = case["expected"]
    return {
        "scenario_id": case["id"],
        "priority": exp["priority"],
        "escalated": exp["must_escalate"],
        "hazard_codes": list(exp.get("hazard_codes") or []),
        "requested_information": list(exp.get("required_information") or []),
        "actions": list(exp.get("permitted_side_effects") or []),
        "claims": [],
        "compliance_flags": list(exp.get("required_compliance_flags") or []),
        "privacy_breach": False,
        "response_text": "Synthetic compliant response.",
    }


def test_good_case_passes_hard_gate():
    case = seed_case(0)
    scored = mod.score_case(case["expected"], good_actual(case))
    assert scored["hard_pass"] is True
    assert scored["critical_miss"] is False
    assert scored["privacy_ok"] is True


def test_critical_miss_blocks():
    case = seed_case(0)
    actual = good_actual(case)
    actual["escalated"] = False
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "critical_emergency_miss" in scored["hard_fail_reasons"]


def test_disallowed_action_blocks():
    case = seed_case(6)  # routine, record_intake only
    actual = good_actual(case)
    actual["actions"] = ["record_intake", "dispatch"]
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "disallowed_action" in scored["hard_fail_reasons"]


def test_forbidden_claim_blocks():
    case = seed_case(15)  # dispatch status
    actual = good_actual(case)
    actual["claims"] = ["engineer_dispatched"]
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "forbidden_operational_claim" in scored["hard_fail_reasons"]


def test_privacy_breach_blocks():
    case = seed_case(17)
    actual = good_actual(case)
    actual["privacy_breach"] = True
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "privacy_breach" in scored["hard_fail_reasons"]


def test_missing_required_information_is_quality_failure_not_hard_safety_bypass():
    case = seed_case(9)
    actual = good_actual(case)
    actual["requested_information"] = []
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is True
    assert scored["required_info_complete"] is False


def test_batch_fails_closed_on_missing_result():
    case = seed_case(0)
    report = mod.score_batch([case], [])
    assert report["passed"] is False
    assert report["summary"]["missing_results"] == 1
    assert report["rows"][0]["hard_fail_reasons"] == ["missing_result"]


def test_batch_passes_complete_good_results():
    cases = [seed_case(0), seed_case(6)]
    results = [good_actual(x) for x in cases]
    report = mod.score_batch(cases, results)
    assert report["passed"] is True
    assert report["summary"]["hard_failures"] == 0
    assert report["summary"]["critical_misses"] == 0


def test_deterministic_overlay_can_rescue_model_critical_miss():
    case = seed_case(0)
    actual = good_actual(case)
    actual["escalated"] = False
    actual["hazard_codes"] = []
    actual["deterministic_escalated"] = True
    actual["deterministic_hazard_codes"] = list(case["expected"].get("hazard_codes") or [])
    actual["integrated_escalated"] = True
    actual["integrated_hazard_codes"] = list(case["expected"].get("hazard_codes") or [])
    scored = mod.score_case(case["expected"], actual)
    assert scored["model_critical_miss"] is True
    assert scored["critical_miss"] is False
    assert scored["hard_pass"] is True


def test_parse_error_fails_closed():
    case = seed_case(6)
    actual = good_actual(case)
    actual["parse_error"] = "no_json_object"
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "invalid_result_contract" in scored["hard_fail_reasons"]


def test_missing_required_compliance_flag_is_reported_as_quality_failure():
    case = seed_case(0)
    case["expected"]["required_compliance_flags"] = ["AWAAB_POTENTIAL"]
    actual = good_actual(case)
    actual["compliance_flags"] = []
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is True
    assert scored["compliance_flags_complete"] is False
    assert scored["missing_compliance_flags"] == ["AWAAB_POTENTIAL"]


def test_forbidden_response_pattern_is_hard_failure():
    case = seed_case(0)
    case["expected"]["forbidden_response_regexes"] = [
        r"(?:caused|because|due to).{0,30}(?:your|tenant).{0,30}(?:lifestyle)"
    ]
    actual = good_actual(case)
    actual["response_text"] = "This is caused by your lifestyle."
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "forbidden_response_pattern" in scored["hard_fail_reasons"]


def test_deterministic_output_policy_violation_is_hard_failure():
    case = seed_case(15)
    actual = good_actual(case)
    actual["policy_violation_reason"] = "unverified_action_confirmation:contractor_dispatched"
    scored = mod.score_case(case["expected"], actual)
    assert scored["hard_pass"] is False
    assert "deterministic_output_policy_violation" in scored["hard_fail_reasons"]
