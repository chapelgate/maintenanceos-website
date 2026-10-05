from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MAP = ROOT / "configs" / "eurohpc" / "release_program_test_map_v2.json"
REGISTRY = ROOT / "configs" / "eurohpc" / "scenario_domain_registry_v2.json"
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_all_release_test_layers_are_explicit():
    cfg = load(MAP)
    layers = {x["layer"] for x in cfg["requirements"]}
    assert {"gpu_model", "cpu_release", "human_professional"} <= layers


def test_all_gpu_release_domains_exist_in_registry():
    cfg = load(MAP)
    reg = load(REGISTRY)
    registered = {x["domain"] for x in reg["domains"]}
    for req in cfg["requirements"]:
        if req["layer"] == "gpu_model":
            for domain in req.get("benchmark_domains", []):
                assert domain in registered, (req["id"], domain)


def test_release_program_keeps_statutory_and_lifecycle_controls_off_gpu():
    cfg = load(MAP)
    by_id = {x["id"]: x for x in cfg["requirements"]}
    for rid in ("REL-AWAAB-02", "REL-DATA-02", "REL-IAM-02", "REL-COMPLAINT-02", "REL-OBS-01"):
        assert by_id[rid]["layer"] == "cpu_release"


def test_awaab_phase_dates_are_frozen_from_authoritative_guidance():
    cfg = load(MAP)
    rule = next(x for x in cfg["requirements"] if x["id"] == "REL-AWAAB-02")
    assert rule["effective_dates"]["phase1"] == "2025-10-27"
    assert rule["effective_dates"]["phase2"] == "2026-11-30"


def test_professional_gates_cannot_be_closed_by_lumi():
    cfg = load(MAP)
    professional = {x["id"] for x in cfg["requirements"] if x["layer"] == "human_professional"}
    assert {"REL-PROVIDER-01", "REL-SECURITY-01", "REL-WEB-01", "REL-BRAND-01"} <= professional


def test_release_integrated_seed_contains_expected_behavioural_families():
    rows = load(SEED)
    families = {x["family"] for x in rows}
    expected = {
        "damp_mould_vulnerability_significance",
        "prior_hazard_material_change",
        "damp_mould_lifestyle_blame_request",
        "contractor_reports_hazard",
        "statutory_deadline_confirmation_without_workflow",
        "access_code_volunteered_unnecessary",
        "unverified_caller_private_history",
        "neighbour_reports_hazard_no_private_status",
        "requested_language_or_format",
        "explicit_complaint_during_repair_call",
        "angry_complaint_no_refusal",
        "legal_entitlement_question_human_review",
    }
    assert expected <= families


def test_cpu_only_domains_never_seed_model_cases():
    reg = load(REGISTRY)
    rows = load(SEED)
    cpu_families = {
        x["development_family"]
        for x in reg["domains"]
        if x["evaluation_lane"] == "cpu_only"
    }
    assert not (cpu_families & {x["family"] for x in rows})
