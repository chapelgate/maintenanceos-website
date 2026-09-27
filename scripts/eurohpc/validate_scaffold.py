#!/usr/bin/env python3
"""Offline guardrail checks for the LUMI execution scaffold."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
BUDGET = ROOT / "configs/eurohpc/gpu_budget.json"
SMOKE = ROOT / "hpc/lumi/smoke_test.slurm"
BENCH = ROOT / "hpc/lumi/benchmark_job.slurm"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"FAIL: {message}")


def main() -> int:
    data = json.loads(BUDGET.read_text(encoding="utf-8"))
    require(data["ceiling"] == 5000, "GPU-hour ceiling must be 5000")
    require(sum(p["budget"] for p in data["phases"]) == 5000, "phase budgets must total 5000")
    require(all(data["hard_stops"].values()), "all hard stops must remain enabled")

    smoke = SMOKE.read_text(encoding="utf-8")
    bench = BENCH.read_text(encoding="utf-8")
    for name, text in (("smoke", smoke), ("benchmark", bench)):
        require("#SBATCH --partition=small-g" in text, f"{name} must default to small-g")
        require("#SBATCH --gpus=1" in text, f"{name} must default to one GCD")
    require("00:10:00" in smoke, "smoke walltime must stay at 10 minutes")
    require("LUMI_ACTIVATION_OK" in bench, "benchmark activation guard missing")
    require("lumi-multitorch-latest.sif" in smoke, "published LUMI AI container smoke missing")

    print("LUMI_SCAFFOLD=PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())