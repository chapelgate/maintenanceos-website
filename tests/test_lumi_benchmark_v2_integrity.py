from __future__ import annotations

import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "validate_lumi_benchmark_v2.py"
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"

spec = importlib.util.spec_from_file_location("lumi_benchmark_v2_validate", SCRIPT)
mod = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(mod)


def load_seed():
    return json.loads(SEED.read_text(encoding="utf-8"))


def test_seed_corpus_passes_integrity_gate():
    report = mod.validate_corpus(load_seed())
    assert report["passed"] is True, report["errors"]
    assert report["summary"]["cases"] == 36
    assert report["summary"]["unique_signatures"] == 36
    assert report["summary"]["families"] == 36


def test_duplicate_substantive_signature_fails():
    rows = load_seed()
    dup = copy.deepcopy(rows[0])
    dup["id"] = "V2-DEV-DUP-SIG"
    dup["input"]["turns"] = ["Different words but same substantive scenario."]
    rows.append(dup)
    report = mod.validate_corpus(rows)
    assert report["passed"] is False
    assert any("duplicate substantive signature" in x for x in report["errors"])


def test_reference_number_only_duplicate_fails():
    rows = load_seed()[:1]
    dup = copy.deepcopy(rows[0])
    dup["id"] = "V2-DEV-REF-DUP"
    dup["signature"]["causal_facts"] = ["same_case_reference_2"]
    dup["input"]["turns"] = [
        "There is a strong gas smell by the boiler, but it has probably always done that. Reference 2.",
        "Please just book it for next week.",
    ]
    rows[0]["input"]["turns"][0] += " Reference 1."
    rows.append(dup)
    report = mod.validate_corpus(rows)
    assert report["passed"] is False
    assert any("cosmetic/near duplicate" in x for x in report["errors"])


def test_family_leakage_across_splits_fails():
    rows = load_seed()[:2]
    rows[1]["family"] = rows[0]["family"]
    rows[1]["split"] = "selection_validation"
    report = mod.validate_corpus(rows)
    assert report["passed"] is False
    assert any("scenario-family split leakage" in x for x in report["errors"])


def test_unreviewed_provenance_fails_closed():
    rows = load_seed()[:1]
    rows[0]["provenance"]["reviewed"] = False
    report = mod.validate_corpus(rows)
    assert report["passed"] is False
    assert any("provenance.reviewed" in x for x in report["errors"])


def test_receptionos_is_layer_not_industry_enum():
    rows = load_seed()
    assert all(row["context"]["industry_os"] != "ReceptionOS" for row in rows)
    assert any(row["context"].get("reception_mode") is True for row in rows)
