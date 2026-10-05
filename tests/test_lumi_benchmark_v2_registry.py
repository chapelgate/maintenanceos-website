from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "configs" / "eurohpc" / "scenario_domain_registry_v2.json"
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_registry_has_unique_split_families():
    reg = load(REGISTRY)
    seen = set()
    for row in reg["domains"]:
        trio = [
            row["development_family"],
            row["selection_validation_family"],
            row["hidden_final_family"],
        ]
        assert len(set(trio)) == 3
        for family in trio:
            assert family not in seen, family
            seen.add(family)


def test_registry_keeps_domains_across_splits_but_families_disjoint():
    reg = load(REGISTRY)
    assert len(reg["domains"]) >= 30
    for row in reg["domains"]:
        assert row["domain"]
        assert row["variant_rule"]
        assert row["evaluation_lane"] in {"gpu_model", "hybrid_cpu_first", "cpu_only"}


def test_seed_uses_registered_development_families_only():
    reg = load(REGISTRY)
    allowed = {x["development_family"] for x in reg["domains"]}
    rows = load(SEED)
    missing = sorted({x["family"] for x in rows} - allowed)
    assert not missing, missing


def test_cpu_only_domains_are_not_seeded_for_gpu_model_scoring():
    reg = load(REGISTRY)
    cpu_only = {x["development_family"] for x in reg["domains"] if x["evaluation_lane"] == "cpu_only"}
    seeded = {x["family"] for x in load(SEED)}
    assert not (cpu_only & seeded)
