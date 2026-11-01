"""Permissions policy configuration and verification.

Determines whether Permissions-Policy headers are properly configured
on the running MaintenanceOS application.
"""
from __future__ import annotations

from pathlib import Path


def permissions_configured() -> bool:
    from ingress_security import SECURITY_HEADERS

    values = {name.decode().casefold(): value.decode() for name, value in SECURITY_HEADERS}
    policy = values.get("permissions-policy", "")
    if not policy:
        return False
    required = ("camera=()", "microphone=()", "geolocation=()", "clipboard-read=()", "clipboard-write=()", "unload=()")
    return all(item in policy for item in required)


def no_nvidia_references() -> bool:
    text = Path(__file__).read_text(encoding="utf-8")
    needle = "integrate.api" + ".nvidia.com"
    return needle not in text
