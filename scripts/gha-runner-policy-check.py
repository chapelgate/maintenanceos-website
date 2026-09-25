#!/usr/bin/env python3
"""Fail cheaply if a workflow reintroduces paid GitHub-hosted Actions compute."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HOSTED_SKU_RE = re.compile(
    r"\b(ubuntu-latest|ubuntu-24\.04|ubuntu-22\.04|ubuntu-20\.04|"
    r"windows-latest|windows-20\d{2}|macos-latest|macos-1[3-9]|"
    r"ubuntu-latest-\d+-cores|ubuntu-(?:latest-)?(?:4|8|16|32|64)-cores?|"
    r"larger?[-_]?runner)\b",
    re.I,
)
RUNS_ON_RE = re.compile(r"^\s*runs-on:\s*(.+?)\s*$", re.M)
TIMEOUT_RE = re.compile(r"^\s*timeout-minutes:\s*(\d+)\s*$", re.M)
CRON_RE = re.compile(r"^\s*-\s*cron:\s*[\"']([^\"']+)[\"']", re.M)
SCHEDULE_RE = re.compile(r"^\s*schedule:\s*$", re.M)
RETRY_RE = re.compile(r"max-attempts:\s*([6-9]|\d{2,})")
FRONT_DOOR_RE = re.compile(r"^ee-front-door-.*\.ya?ml$")


def load_allowlist(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def parse_runs_on(raw: str) -> str:
    return raw.strip().strip("'\"")


def workflow_events(text: str) -> set[str]:
    events = set()
    if re.search(r"^  pull_request:", text, re.M) or re.search(r"^  pull_request_target:", text, re.M):
        events.add("pull_request")
    if re.search(r"^  push:", text, re.M):
        events.add("push")
    if re.search(r"^  schedule:", text, re.M):
        events.add("schedule")
    if re.search(r"^  workflow_dispatch:", text, re.M):
        events.add("workflow_dispatch")
    return events


def is_front_door(name: str, allow: dict) -> bool:
    extra = set(allow.get("doNotEditWorkflows") or [])
    return bool(FRONT_DOOR_RE.match(name) or name in extra)


def check_file(path: Path, allow: dict) -> list[str]:
    text = path.read_text(encoding="utf-8")
    name = path.name
    errors: list[str] = []
    if is_front_door(name, allow):
        return errors

    hosted = {k.lower() for k in (allow.get("githubHostedAllowed") or {})}
    paid_allow = {s.lower() for s in allow.get("explicitPaidAllow") or []}
    self_cfg = allow.get("selfHosted") or {}
    required = [x.lower() for x in self_cfg.get("requiredLabels") or []]
    allowed_self_wf = set(self_cfg.get("allowedWorkflows") or [])
    forbidden_events = set(self_cfg.get("forbiddenEvents") or [])
    events = workflow_events(text)
    allow_all_self = not allowed_self_wf or "*" in allowed_self_wf

    for raw in RUNS_ON_RE.findall(text):
        value = parse_runs_on(raw)
        lowered = value.lower()
        if "self-hosted" in lowered:
            if not allow_all_self and name not in allowed_self_wf:
                errors.append(f"{name}: self-hosted runner is not on the allowlist")
            labels = [p.strip().strip("'\" ").lower() for p in value.strip("[]").split(",") if p.strip()]
            missing = [lab for lab in required if lab not in labels]
            if missing:
                errors.append(f"{name}: self-hosted missing required labels {missing}")
            if events & forbidden_events:
                errors.append(f"{name}: self-hosted must not run on {sorted(events & forbidden_events)}")
            continue
        token = lowered.strip("[]'\" ")
        if token.startswith("${{"):
            continue
        if token in paid_allow:
            continue
        if token in hosted:
            errors.append(f"{name}: GitHub-hosted runner {value!r} is not permitted (target £0 hosted compute)")
            continue
        if HOSTED_SKU_RE.search(token):
            errors.append(f"{name}: paid/hosted runner SKU {value!r} is forbidden")
        else:
            errors.append(f"{name}: unapproved runs-on {value!r}")

    if allow.get("requireTimeoutMinutes"):
        runs = RUNS_ON_RE.findall(text)
        timeouts = TIMEOUT_RE.findall(text)
        if runs and len(timeouts) < len(runs):
            errors.append(
                f"{name}: timeout-minutes required on every job "
                f"(runs-on={len(runs)} timeout-minutes={len(timeouts)})"
            )

    if SCHEDULE_RE.search(text) or CRON_RE.search(text):
        allowed_crons = []
        for item in allow.get("cronAllowlist") or []:
            if item.get("workflow") == name or item.get("workflow") == "*":
                allowed_crons = list(item.get("crons") or ["*"])
        found = CRON_RE.findall(text)
        if not allowed_crons:
            errors.append(f"{name}: unapproved cron/schedule")
        elif "*" not in allowed_crons:
            extra = [c for c in found if c not in allowed_crons]
            missing = [c for c in allowed_crons if c not in found]
            if extra:
                errors.append(f"{name}: unapproved cron {extra}")
            if missing:
                errors.append(f"{name}: registered cron missing {missing}")

    if allow.get("forbidRetryLoops") and RETRY_RE.search(text):
        errors.append(f"{name}: dangerous retry loop (max-attempts >= 6)")

    return errors


def main(argv: list[str]) -> int:
    repo = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    allow_path = repo / ".github" / "gha-runner-allowlist.json"
    if not allow_path.is_file():
        print(f"FAIL missing allowlist {allow_path}", file=sys.stderr)
        return 2
    allow = load_allowlist(allow_path)
    wf_dir = repo / ".github" / "workflows"
    errors: list[str] = []
    files = sorted(wf_dir.glob("*.yml")) + sorted(wf_dir.glob("*.yaml"))
    # Nested workflow copies (cloud-workers jobs/)
    extra = allow.get("extraWorkflowDirs") or []
    for rel in extra:
        extra_dir = repo / rel
        if extra_dir.is_dir():
            files.extend(sorted(extra_dir.glob("*.yml")))
    for path in files:
        errors.extend(check_file(path, allow))
    if errors:
        print("GHA runner policy FAIL")
        for e in errors:
            print(f" - {e}")
        return 1
    print("GHA runner policy PASS")
    print(f"allowlist={allow_path}")
    print(f"workflows_scanned={len(files)}")
    print("hosted_compute_target=£0")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
