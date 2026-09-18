#!/usr/bin/env python3
"""Provision a dedicated MaintenanceOS voice/test droplet in London (lon1).

Requires DIGITALOCEAN_TOKEN (or DIGITALOCEAN_ACCESS_TOKEN / DO_API_TOKEN).
Does NOT modify existing Chapelgate droplets (HLO, Evidence Wallet, Cheap Trips).

Creates:
  - Ubuntu droplet in lon1 with monitoring + backups
  - Cloud firewall (22/80/443)
  - SSH key for this agent
  - cloud-init that installs Docker and waits for deploy

Secrets are NEVER written to git. Runtime secrets are injected via DO user_data
env file generated locally under /tmp (mode 600) only when provided in the
agent environment.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.digitalocean.com/v2"
DROPLET_NAME = "chapelgate-maintenanceos-voice-test"
REGION = "lon1"
SIZE = "s-2vcpu-4gb"  # minimal production-capable for WSS + Gemini
IMAGE = "ubuntu-24-04-x64"
PROTECTED_NAMES = {
    "chapelgate-hlo-production",
    "chapelgate-production-wallet",
    "chapelgate-cheap-trips-production",
    "chapelgate-production-01",
    "chapelgate-production-01-keyed",
}
PROTECTED_IPS = {"167.99.202.163", "46.101.16.174", "206.189.112.98"}


def _token() -> str:
    for key in ("DIGITALOCEAN_TOKEN", "DIGITALOCEAN_ACCESS_TOKEN", "DO_API_TOKEN"):
        value = (os.getenv(key) or "").strip()
        if value:
            return value
    return ""


def _request(method: str, path: str, payload: dict | None = None) -> dict:
    token = _token()
    if not token:
        raise SystemExit(
            "MISSING_SECRET:DIGITALOCEAN_TOKEN — cannot create London voice droplet"
        )
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{API}{path}",
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode() or "{}"
            return json.loads(body)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode()[:500]
        raise SystemExit(f"DigitalOcean API {exc.code} on {method} {path}: {detail}") from exc


def _ensure_ssh_key() -> str:
    ssh_dir = Path.home() / ".ssh"
    ssh_dir.mkdir(mode=0o700, exist_ok=True)
    private = ssh_dir / "mos_voice_ed25519"
    public = Path(str(private) + ".pub")
    if not private.exists():
        import subprocess

        subprocess.check_call(
            [
                "ssh-keygen",
                "-t",
                "ed25519",
                "-N",
                "",
                "-f",
                str(private),
                "-C",
                "maintenanceos-voice-agent",
            ]
        )
        private.chmod(0o600)
    pub = public.read_text().strip()
    existing = _request("GET", "/account/keys?per_page=200").get("ssh_keys", [])
    for key in existing:
        if key.get("public_key", "").strip() == pub:
            return str(key["id"])
    created = _request(
        "POST",
        "/account/keys",
        {"name": f"mos-voice-agent-{int(time.time())}", "public_key": pub},
    )
    return str(created["ssh_key"]["id"])


def _cloud_init(repo_sha: str) -> str:
    # Install Docker only; deploy step pushes compose + secrets over SSH.
    return f"""#cloud-config
package_update: true
packages:
  - apt-transport-https
  - ca-certificates
  - curl
  - gnupg
  - ufw
runcmd:
  - curl -fsSL https://get.docker.com | sh
  - systemctl enable --now docker
  - ufw allow OpenSSH
  - ufw allow 80/tcp
  - ufw allow 443/tcp
  - ufw allow 443/udp
  - ufw --force enable
  - mkdir -p /opt/maintenanceos
  - echo "{repo_sha}" > /opt/maintenanceos/TARGET_SHA
final_message: "MaintenanceOS voice droplet cloud-init complete"
"""


def _find_existing() -> dict | None:
    droplets = _request("GET", "/droplets?per_page=200").get("droplets", [])
    for droplet in droplets:
        name = droplet.get("name") or ""
        if name == DROPLET_NAME:
            return droplet
        if name in PROTECTED_NAMES:
            continue
    return None


def _public_ipv4(droplet: dict) -> str:
    for net in droplet.get("networks", {}).get("v4", []):
        if net.get("type") == "public":
            return str(net.get("ip_address") or "")
    return ""


def _wait_active(droplet_id: int, timeout: int = 300) -> dict:
    deadline = time.time() + timeout
    while time.time() < deadline:
        droplet = _request("GET", f"/droplets/{droplet_id}")["droplet"]
        if droplet.get("status") == "active" and _public_ipv4(droplet):
            return droplet
        time.sleep(5)
    raise SystemExit(f"Droplet {droplet_id} did not become active in time")


def ensure_firewall(droplet_id: int) -> None:
    name = "chapelgate-maintenanceos-voice-fw"
    firewalls = _request("GET", "/firewalls?per_page=200").get("firewalls", [])
    fw = next((f for f in firewalls if f.get("name") == name), None)
    inbound = [
        {"protocol": "tcp", "ports": "22", "sources": {"addresses": ["0.0.0.0/0", "::/0"]}},
        {"protocol": "tcp", "ports": "80", "sources": {"addresses": ["0.0.0.0/0", "::/0"]}},
        {"protocol": "tcp", "ports": "443", "sources": {"addresses": ["0.0.0.0/0", "::/0"]}},
        {"protocol": "udp", "ports": "443", "sources": {"addresses": ["0.0.0.0/0", "::/0"]}},
    ]
    outbound = [
        {"protocol": "tcp", "ports": "0", "destinations": {"addresses": ["0.0.0.0/0", "::/0"]}},
        {"protocol": "udp", "ports": "0", "destinations": {"addresses": ["0.0.0.0/0", "::/0"]}},
        {"protocol": "icmp", "ports": "0", "destinations": {"addresses": ["0.0.0.0/0", "::/0"]}},
    ]
    body = {
        "name": name,
        "inbound_rules": inbound,
        "outbound_rules": outbound,
        "droplet_ids": [droplet_id],
    }
    if fw:
        _request("PUT", f"/firewalls/{fw['id']}", body)
    else:
        _request("POST", "/firewalls", body)


def main() -> int:
    repo_sha = (os.getenv("MOS_DEPLOY_SHA") or "").strip() or "main"
    existing = _find_existing()
    if existing:
        ip = _public_ipv4(existing)
        if ip in PROTECTED_IPS:
            raise SystemExit("Refusing to reuse a protected Chapelgate production IP")
        print(
            json.dumps(
                {
                    "ok": True,
                    "action": "reuse",
                    "droplet_id": existing["id"],
                    "name": existing["name"],
                    "region": (existing.get("region") or {}).get("slug"),
                    "ip": ip,
                    "status": existing.get("status"),
                },
                indent=2,
            )
        )
        ensure_firewall(int(existing["id"]))
        return 0

    key_id = _ensure_ssh_key()
    payload = {
        "name": DROPLET_NAME,
        "region": REGION,
        "size": SIZE,
        "image": IMAGE,
        "ssh_keys": [key_id],
        "backups": True,
        "monitoring": True,
        "ipv6": False,
        "vpc_uuid": os.getenv("DO_VPC_UUID") or None,
        "tags": ["maintenanceos", "voice-test", "london"],
        "user_data": _cloud_init(repo_sha),
    }
    if not payload["vpc_uuid"]:
        payload.pop("vpc_uuid")

    created = _request("POST", "/droplets", payload)["droplet"]
    droplet = _wait_active(int(created["id"]))
    ip = _public_ipv4(droplet)
    if ip in PROTECTED_IPS:
        raise SystemExit("Refusing unexpected protected IP assignment")
    ensure_firewall(int(droplet["id"]))
    print(
        json.dumps(
            {
                "ok": True,
                "action": "created",
                "droplet_id": droplet["id"],
                "name": droplet["name"],
                "region": (droplet.get("region") or {}).get("slug"),
                "ip": ip,
                "size": SIZE,
                "backups": True,
                "monitoring": True,
                "ssh_key": "mos_voice_ed25519",
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
