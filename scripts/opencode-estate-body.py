"""Body text the /oc post-step appends, and which pull requests receive it.

The OpenCode action writes the pull request body and revokes its token
before the next workflow step. This module builds the estate lines and
picks the pull requests that step edits with `gh pr edit --body-file`.
"""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PREFLIGHT_LINE = "Estate-Preflight: yes"
WORKER_LINE = "Estate-Worker: NVIDIA /oc"
ARTIFACT_PREFIX = "Estate-Artifact: "

# Case labels in the pinned estate gate. READ_ONLY rejects every pull request.
# TRIVIAL passes only on the docs/evidence fast path, and that path needs no spec files.
ACCEPTED_ROUTES = ("READ_ONLY", "TRIVIAL", "BUG", "FEATURE", "HIGH_RISK", "IDEA")
# Bash [[ artifact == pattern ]] globs. A run URL matches none of these.
ARTIFACT_GLOBS = {
    "BUG": ".specify/bugs/*",
    "FEATURE": "specs/*",
    "HIGH_RISK": "specs/*",
    "IDEA": ".specify/assessments/*",
}
MANAGED_KEYS = ("Estate-Preflight:", "Estate-Route:", "Estate-Artifact:", "Estate-Worker:", "Estate-Converged:")


def parse_route(comment: str) -> str | None:
    """First accepted Route or Estate-Route token in the /oc comment, else None."""
    pattern = re.compile(r"(?im)^[ \t]*(?:Estate-)?Route:[ \t]*([A-Za-z_]+)")
    for match in pattern.finditer(comment or ""):
        token = match.group(1).upper()
        if token in ACCEPTED_ROUTES:
            return token
    return None


def artifact_matches(route: str, artifact: str) -> bool:
    pattern = ARTIFACT_GLOBS.get(route)
    if pattern is None:
        return True
    if not artifact:
        return False
    result = subprocess.run(
        ["bash", "-c", '[[ "$1" == $2 ]]', "_", artifact, pattern],
        capture_output=True,
    )
    return result.returncode == 0


def comment_artifact(comment: str, route: str) -> str | None:
    pattern = re.compile(r"(?im)^[ \t]*(?:Estate-)?Artifact:[ \t]*(.+?)\s*$")
    for match in pattern.finditer(comment or ""):
        value = match.group(1).strip()
        if artifact_matches(route, value):
            return value
    return None


def discover_artifact(route: str, changed_files) -> str | None:
    glob = ARTIFACT_GLOBS.get(route)
    if glob is None:
        return None
    prefix = glob[:-1]
    found: list[str] = []
    for raw in changed_files or []:
        path = str(raw).strip().replace("\\", "/")
        if not path.startswith(prefix):
            continue
        slug = path[len(prefix) :].split("/")[0]
        if not slug:
            continue
        candidate = prefix + slug
        if artifact_matches(route, candidate) and candidate not in found:
            found.append(candidate)
    return found[0] if found else None


def choose_artifact(route: str, comment: str, changed_files, run_url: str) -> str | None:
    """Run URL only for classes whose artifact the gate does not glob-check."""
    if route in ARTIFACT_GLOBS:
        return comment_artifact(comment, route) or discover_artifact(route, changed_files)
    return run_url.strip()


def _first_field(body: str, label: str) -> str:
    pattern = re.compile(rf"(?im)^[ \t]*{re.escape(label)}[ \t]*(.+?)\s*$")
    match = pattern.search(body or "")
    return match.group(1).strip() if match else ""


def _first_route(body: str) -> str:
    pattern = re.compile(r"(?im)^[ \t]*Estate-Route:[ \t]*([A-Za-z_]+)")
    match = pattern.search(body or "")
    return match.group(1).upper() if match else ""


def _strip_managed(body: str) -> str:
    kept = []
    for line in (body or "").splitlines():
        stripped = line.strip()
        if any(stripped.startswith(key) for key in MANAGED_KEYS):
            continue
        kept.append(line)
    text = "\n".join(kept).strip("\n")
    return text


def _already(body: str, route: str, artifact: str | None) -> bool:
    if _first_route(body) != route:
        return False
    if _first_field(body, "Estate-Preflight:").lower() not in ("yes", "passed"):
        return False
    if not any(line.strip() == WORKER_LINE for line in (body or "").splitlines()):
        return False
    existing = _first_field(body, "Estate-Artifact:")
    if route in ARTIFACT_GLOBS:
        return bool(artifact) and existing == artifact
    return bool(existing)


def append_estate_lines(body: str, run_url: str, comment: str = "", changed_files=None) -> bytes | None:
    """Return the full body as UTF-8 with no BOM, or None when the gate lines are already right."""
    if not run_url or not run_url.strip():
        raise ValueError("run URL is required")
    changed = list(changed_files or [])
    requested = parse_route(comment)
    if requested is None:
        existing_route = _first_route(body)
        if existing_route in ACCEPTED_ROUTES and existing_route != "READ_ONLY":
            route = existing_route
        else:
            route = "TRIVIAL"
    else:
        route = requested
    if requested is None and route in ARTIFACT_GLOBS:
        existing_artifact = _first_field(body, "Estate-Artifact:")
        if artifact_matches(route, existing_artifact):
            artifact = existing_artifact
        else:
            artifact = choose_artifact(route, comment, changed, run_url)
    else:
        artifact = choose_artifact(route, comment, changed, run_url)
    if _already(body, route, artifact):
        return None
    lines = [
        PREFLIGHT_LINE,
        f"Estate-Route: {route}",
        WORKER_LINE,
    ]
    if artifact:
        lines.append(f"{ARTIFACT_PREFIX}{artifact}")
    if route in ("FEATURE", "HIGH_RISK"):
        lines.append("Estate-Converged: yes")
    text = "\n".join(lines) + "\n"
    rest = _strip_managed(body)
    if rest:
        text += "\n" + rest + "\n"
    data = text.encode("utf-8")
    if data.startswith(b"\xef\xbb\xbf"):
        raise RuntimeError("body bytes must not start with a BOM")
    return data


def write_body_file(path: str, data: bytes) -> None:
    if data.startswith(b"\xef\xbb\xbf"):
        raise RuntimeError("refusing to write a body file that starts with a BOM")
    Path(path).write_bytes(data)


def select_pr_numbers(local_branches, api_prs, event_is_pr, event_number, comment_at) -> list[int]:
    """Pull requests this run opened (opencode head created here) or updated (the commented PR)."""
    numbers: list[int] = []
    by_head: dict[str, list[int]] = {}
    for pr in api_prs:
        by_head.setdefault(pr["headRefName"], []).append(int(pr["number"]))
    for branch in local_branches:
        if str(branch).startswith("opencode/"):
            numbers.extend(by_head.get(branch, []))
    if event_number is not None and comment_at:
        pattern = re.compile(rf"^opencode/(?:issue|pr){int(event_number)}-")
        cutoff = _parse_time(comment_at)
        for pr in api_prs:
            if not pattern.match(pr["headRefName"]):
                continue
            if _parse_time(pr["createdAt"]) >= cutoff:
                numbers.append(int(pr["number"]))
    if event_is_pr and event_number is not None:
        numbers.append(int(event_number))
    seen: set[int] = set()
    ordered: list[int] = []
    for number in numbers:
        if number not in seen:
            seen.add(number)
            ordered.append(number)
    return ordered


def _parse_time(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _gh_json(args: list[str]):
    result = subprocess.run(["gh", *args], check=True, capture_output=True, text=True)
    return json.loads(result.stdout or "null")


def _changed_files() -> list[str]:
    default = os.environ.get("DEFAULT_BRANCH", "").strip()
    if not default:
        return []
    ref = f"origin/{default}"
    verify = subprocess.run(["git", "rev-parse", "--verify", ref], capture_output=True, text=True)
    if verify.returncode != 0:
        ref = default
    result = subprocess.run(
        ["git", "diff", "--name-only", f"{ref}...HEAD"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        return []
    return [line for line in result.stdout.splitlines() if line]


def _local_opencode_branches() -> list[str]:
    result = subprocess.run(
        ["git", "for-each-ref", "--format=%(refname:short)", "refs/heads/opencode"],
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in result.stdout.splitlines() if line.startswith("opencode/")]


def _selected_numbers() -> list[int]:
    repo = os.environ["REPO"]
    event_number_raw = os.environ.get("EVENT_NUMBER", "").strip()
    event_number = int(event_number_raw) if event_number_raw else None
    event_is_pr = os.environ.get("EVENT_IS_PR", "").strip().lower() == "true"
    comment_at = os.environ.get("COMMENT_AT", "").strip()
    local = _local_opencode_branches()
    api = _gh_json(
        [
            "pr",
            "list",
            "--repo",
            repo,
            "--state",
            "open",
            "--limit",
            "40",
            "--json",
            "number,headRefName,createdAt",
        ]
    )
    for branch in local:
        api.extend(
            _gh_json(
                [
                    "pr",
                    "list",
                    "--repo",
                    repo,
                    "--head",
                    branch,
                    "--state",
                    "open",
                    "--json",
                    "number,headRefName,createdAt",
                ]
            )
        )
    return select_pr_numbers(local, api, event_is_pr, event_number, comment_at)


def main(argv: list[str]) -> int:
    if "--write" in argv:
        path = argv[argv.index("--write") + 1]
        data = append_estate_lines(
            sys.stdin.read(),
            os.environ["RUN_URL"],
            os.environ.get("COMMENT_BODY", ""),
            _changed_files(),
        )
        if data is None:
            print("estate lines already present", file=sys.stderr)
            return 3
        write_body_file(path, data)
        return 0
    if "--select" in argv:
        for number in _selected_numbers():
            print(number)
        return 0
    print("usage: opencode-estate-body.py --select | --write BODY_FILE", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

