#!/usr/bin/env python3
"""Capture non-secret LUMI allocation/job evidence as JSON."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path


def run(cmd: list[str]) -> dict:
    try:
        proc = subprocess.run(cmd, text=True, capture_output=True, check=False)
        return {
            "command": cmd,
            "returncode": proc.returncode,
            "stdout": proc.stdout.strip(),
            "stderr": proc.stderr.strip(),
        }
    except FileNotFoundError as exc:
        return {
            "command": cmd,
            "returncode": 127,
            "stdout": "",
            "stderr": str(exc),
        }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--label", required=True)
    parser.add_argument("--job-id", default=os.getenv("SLURM_JOB_ID"))
    parser.add_argument("--out-dir", default="artifacts/eurohpc/usage")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc)

    payload = {
        "schema": "maintenanceos.lumi-usage-snapshot.v2",
        "label": args.label,
        "captured_at_utc": now.isoformat(),
        "job_id": args.job_id,
        "git_commit": run(["git", "rev-parse", "HEAD"]),
        "allocation": run(["lumi-allocations"]),
    }

    if args.job_id:
        payload["sacct"] = run([
            "sacct", "-j", str(args.job_id),
            "--format=JobID,Partition,State,Elapsed,AllocTRES,Start,End",
            "--parsable2",
        ])

    safe_label = "".join(c if c.isalnum() or c in "-_" else "_" for c in args.label)
    path = out_dir / f"{now.strftime('%Y%m%dT%H%M%SZ')}-{safe_label}.json"
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(path)
    return 0 if payload["allocation"]["returncode"] == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())