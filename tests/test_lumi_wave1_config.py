from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CFG = ROOT / "configs" / "eurohpc" / "wave1_candidates_20261006.json"


def load():
    return json.loads(CFG.read_text(encoding="utf-8"))


def test_wave1_is_small_bounded_and_unique():
    cfg = load()
    rows = cfg["candidates"]
    assert len(rows) == 6
    ids = [x["id"] for x in rows]
    assert len(ids) == len(set(ids))
    assert all(x["gcds"] == 1 for x in rows)
    assert cfg["limits"]["array_concurrency"] <= 4
    assert cfg["limits"]["wall_minutes_per_candidate"] <= 45


def test_wave1_excludes_two_gcd_ceiling_candidate():
    cfg = load()
    assert "qwen3-32b" not in {x["id"] for x in cfg["candidates"]}


def test_wave1_max_gpu_hour_exposure_is_tiny():
    cfg = load()
    candidates = len(cfg["candidates"])
    wall_h = cfg["limits"]["wall_minutes_per_candidate"] / 60.0
    gcds = max(x["gcds"] for x in cfg["candidates"])
    # LUMI small-g billing: 0.5 GPU-hour per GCD-hour.
    worst_case = candidates * wall_h * gcds * 0.5
    assert worst_case <= 2.25
