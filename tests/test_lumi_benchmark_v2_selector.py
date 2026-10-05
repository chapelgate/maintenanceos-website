from __future__ import annotations

import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "select_lumi_benchmark_shard_v2.py"
REGISTRY = ROOT / "configs" / "eurohpc" / "scenario_domain_registry_v2.json"
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"

spec = importlib.util.spec_from_file_location("select_lumi_benchmark_shard_v2", SCRIPT)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)


def test_seed_selection_is_deterministic_and_balanced():
    cases = json.loads(SEED.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    a = mod.select_balanced(cases, registry, "development", 12, "round-a-v1")
    b = mod.select_balanced(cases, registry, "development", 12, "round-a-v1")
    assert [x["id"] for x in a] == [x["id"] for x in b]
    assert len(a) == 12
    assert len({x["family"] for x in a}) == 12


def test_different_seed_changes_order_not_membership_when_select_all():
    cases = json.loads(SEED.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    a = mod.select_balanced(cases, registry, "development", 999, "a")
    b = mod.select_balanced(cases, registry, "development", 999, "b")
    assert {x["id"] for x in a} == {x["id"] for x in b}
    assert [x["id"] for x in a] != [x["id"] for x in b]
