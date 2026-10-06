#!/usr/bin/env python3
"""Estimate LUMI-G GPU-hour consumption from sacct root array-task rows.

For small-g, published billing is 0.5 GPU-hour per allocated GCD-hour.
This script is intentionally conservative and ignores CPU-only jobs.
"""

from __future__ import annotations
import argparse, csv, io, json, re, sys

GPU_RE = re.compile(r"(?:gres/gpu|gpu)=([0-9]+)")

def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--small-g-rate", type=float, default=0.5)
    ap.add_argument("--out")
    args=ap.parse_args()
    rows=list(csv.DictReader(io.StringIO(sys.stdin.read()), delimiter="|"))
    billed=[]
    total=0.0
    for row in rows:
        jid=(row.get("JobIDRaw") or "").strip()
        if not jid or "." in jid:
            continue
        partition=(row.get("Partition") or "").strip()
        if partition != "small-g":
            continue
        elapsed=int((row.get("ElapsedRaw") or "0").strip() or 0)
        tres=(row.get("AllocTRES") or "")
        m=GPU_RE.search(tres)
        gpus=int(m.group(1)) if m else 1
        gpu_hours=(elapsed/3600.0)*gpus*args.small_g_rate
        total += gpu_hours
        billed.append({
            "job_id":jid,
            "state":(row.get("State") or "").strip(),
            "elapsed_seconds":elapsed,
            "gcds":gpus,
            "estimated_gpu_hours":round(gpu_hours,6),
        })
    report={
        "method":"sacct_elapsed_x_allocated_gcds_x_small_g_rate",
        "small_g_rate_gpu_hours_per_gcd_hour":args.small_g_rate,
        "jobs":billed,
        "estimated_gpu_hours_total":round(total,6),
    }
    rendered=json.dumps(report,indent=2,sort_keys=True)
    if args.out:
        open(args.out,"w",encoding="utf-8").write(rendered+"\n")
    print(rendered)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
