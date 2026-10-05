from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG = ROOT / "configs" / "eurohpc" / "model_candidates_v2.json"


def test_candidate_registry_is_small_and_bounded():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    rows = cfg["candidates"]
    assert 4 <= len(rows) <= 8
    ids = [x["id"] for x in rows]
    assert len(ids) == len(set(ids))
    assert all(x["initial_gcds"] in {1, 2} for x in rows)


def test_every_candidate_has_searchable_license_and_compatibility_evidence():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    for row in cfg["candidates"]:
        assert row["license"] in {"Apache-2.0", "MIT"}
        assert row["source"].startswith("https://huggingface.co/")
        assert row["rocm_evidence"].startswith("https://rocm.docs.amd.com/")
        assert row["rocm_status"]


def test_large_dense_candidate_is_not_round_a_default():
    cfg = json.loads(CFG.read_text(encoding="utf-8"))
    qwen32 = next(x for x in cfg["candidates"] if x["id"] == "qwen3-32b")
    assert qwen32["tier"] == "C"
    assert qwen32["initial_gcds"] == 2
