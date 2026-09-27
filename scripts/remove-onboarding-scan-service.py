#!/usr/bin/env python3
"""Fail-closed retirement tool for the paid DigitalOcean onboarding-scan service."""

from __future__ import annotations

import argparse
import copy
import json
import os
import sys
import time
import urllib.error
import urllib.request

APP_ID = "98e3a9c0-3b3c-48eb-ac72-2b13ffbe2661"
APP_NAME = "seahorse-app"
TARGET_SERVICE = "onboarding-scan"
ORIGIN = "https://seahorse-app-4oasq.ondigitalocean.app"
TARGET_PUBLIC_ENDPOINT = f"{ORIGIN}/onboarding-scan/v1/onboarding/scan"
API = "https://api.digitalocean.com/v2/apps"


class GuardError(RuntimeError):
    pass


def updated_spec(spec: dict) -> dict:
    out = copy.deepcopy(spec)
    static_sites = out.get("static_sites") or []
    if not static_sites:
        raise GuardError("refusing: no static_sites component would remain")

    services = out.get("services") or []
    matches = [s for s in services if s.get("name") == TARGET_SERVICE]
    if len(matches) != 1:
        raise GuardError(f"refusing: expected exactly one {TARGET_SERVICE!r} service, found {len(matches)}")
    out["services"] = [s for s in services if s.get("name") != TARGET_SERVICE]

    ingress = out.get("ingress")
    if isinstance(ingress, dict):
        rules = ingress.get("rules") or []
        ingress["rules"] = [
            rule for rule in rules
            if ((rule.get("component") or {}).get("name") != TARGET_SERVICE)
        ]
    return out


def request_json(method: str, path: str, token: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "chapelgate-onboarding-scan-retirement/1",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def fetch_text(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "chapelgate-retirement-check/1"})
    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read().decode("utf-8", "replace")


def live_bundle_references_target() -> bool:
    html = fetch_text(f"{ORIGIN}/create/")
    srcs = []
    marker = '<script'
    for chunk in html.split(marker)[1:]:
        if 'src="' not in chunk:
            continue
        src = chunk.split('src="', 1)[1].split('"', 1)[0]
        if src.startswith("/"):
            src = ORIGIN + src
        if src.startswith("http"):
            srcs.append(src)
    return any(TARGET_PUBLIC_ENDPOINT in fetch_text(src) for src in sorted(set(srcs)))


def http_status(url: str) -> int:
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": "chapelgate-retirement-check/1"})
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code


def verify_post_change(timeout_seconds: int = 300) -> bool:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        root_ok = http_status(ORIGIN + "/") == 200
        create_ok = http_status(ORIGIN + "/create/") == 200
        scan_removed = http_status(ORIGIN + "/onboarding-scan/health") != 200
        if root_ok and create_ok and scan_removed:
            return True
        time.sleep(5)
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--confirm", default="")
    parser.add_argument("--dependency-check-only", action="store_true")
    args = parser.parse_args()

    if args.dependency_check_only:
        referenced = live_bundle_references_target()
        print(f"LIVE_BUNDLE_REFERENCES_TARGET={str(referenced).lower()}")
        return 2 if referenced else 0

    token = os.environ.get("DIGITALOCEAN_TOKEN", "").strip()
    if not token:
        raise GuardError("DIGITALOCEAN_TOKEN is required (use a scoped token with app:read + app:update)")

    payload = request_json("GET", f"/{APP_ID}", token)
    app = payload.get("app") or {}
    spec = app.get("spec") or {}
    if app.get("id") != APP_ID or spec.get("name") != APP_NAME:
        raise GuardError("refusing: app identity mismatch")

    candidate = updated_spec(spec)
    print(f"APP_ID={APP_ID}")
    print(f"APP_NAME={spec.get('name')}")
    print(f"STATIC_SITE_COUNT={len(candidate.get('static_sites') or [])}")
    print(f"TARGET_SERVICE_REMOVED={TARGET_SERVICE}")
    print("MODE=DRY_RUN" if not args.apply else "MODE=APPLY")

    if live_bundle_references_target():
        raise GuardError("refusing: live /create bundle still references the paid onboarding-scan endpoint")

    if not args.apply:
        print("RETIREMENT_GUARD=PASS_READY_FOR_APPLY")
        return 0

    expected = f"{APP_ID}:{TARGET_SERVICE}"
    if args.confirm != expected:
        raise GuardError(f"refusing: --confirm must equal {expected!r}")

    request_json("PUT", f"/{APP_ID}", token, {"spec": candidate})
    if verify_post_change():
        print("ONBOARDING_SCAN_RETIREMENT=PASS")
        return 0

    print("post-change verification failed; restoring original spec", file=sys.stderr)
    request_json("PUT", f"/{APP_ID}", token, {"spec": spec})
    raise GuardError("retirement verification failed; original app spec restored")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (GuardError, urllib.error.URLError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
