#!/usr/bin/env python3
"""Deterministically select balanced benchmark shards without cherry-picking."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any


def read_records(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".jsonl":
        return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, list):
        raise ValueError("corpus must be JSON list or JSONL")
    return value


def stable_key(seed: str, scenario_id: str) -> str:
    return hashlib.sha256(f"{seed}\0{scenario_id}".encode()).hexdigest()


def registry_map(registry: dict[str, Any], split: str) -> dict[str, dict[str, Any]]:
    key = {
        "development": "development_family",
        "selection_validation": "selection_validation_family",
        "hidden_final": "hidden_final_family",
    }[split]
    out = {}
    for row in registry["domains"]:
        out[row[key]] = row
    return out


def select_balanced(
    cases: list[dict[str, Any]],
    registry: dict[str, Any],
    split: str,
    count: int,
    seed: str,
) -> list[dict[str, Any]]:
    fam_meta = registry_map(registry, split)
    eligible = [
        c for c in cases
        if c.get("split") == split
        and c.get("family") in fam_meta
        and fam_meta[c["family"]]["evaluation_lane"] != "cpu_only"
    ]
    if count <= 0 or count > len(eligible):
        count = len(eligible)

    by_family: defaultdict[str, list[dict[str, Any]]] = defaultdict(list)
    for c in eligible:
        by_family[c["family"]].append(c)
    for family in by_family:
        by_family[family].sort(key=lambda x: stable_key(seed, str(x["id"])))

    selected: list[dict[str, Any]] = []
    family_names = sorted(by_family, key=lambda f: stable_key(seed, f))

    # Round-robin families first so a large family cannot dominate a small shard.
    index = 0
    while len(selected) < count:
        progressed = False
        for family in family_names:
            rows = by_family[family]
            if index < len(rows):
                selected.append(rows[index])
                progressed = True
                if len(selected) >= count:
                    break
        if not progressed:
            break
        index += 1

    selected.sort(key=lambda x: stable_key(seed, str(x["id"])))
    return selected


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("corpus", type=Path)
    ap.add_argument("--registry", type=Path, default=Path("configs/eurohpc/scenario_domain_registry_v2.json"))
    ap.add_argument("--split", choices=["development","selection_validation","hidden_final"], required=True)
    ap.add_argument("--count", type=int, required=True)
    ap.add_argument("--seed", required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--manifest", type=Path)
    args = ap.parse_args()

    cases = read_records(args.corpus)
    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    selected = select_balanced(cases, registry, args.split, args.count, args.seed)
    if not selected:
        raise SystemExit("no eligible cases selected")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(selected, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    canonical = json.dumps(selected, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    manifest = {
        "split": args.split,
        "requested_count": args.count,
        "selected_count": len(selected),
        "seed": args.seed,
        "sha256": hashlib.sha256(canonical).hexdigest(),
        "scenario_ids": [x["id"] for x in selected],
        "families": sorted({x["family"] for x in selected}),
    }
    if args.manifest:
        args.manifest.parent.mkdir(parents=True, exist_ok=True)
        args.manifest.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    else:
        print(json.dumps(manifest, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
