"""Permissions policy configuration and verification.

Determines whether Permissions-Policy headers are properly configured
on the running MaintenanceOS application.
"""
from __future__ import annotations

from pathlib import Path


REQUIRED_PERMISSIONS_FEATURES = (
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "bluetooth=()",
    "accelerometer=()",
    "gyroscope=()",
    "magnetometer=()",
    "midi=()",
    "display-capture=()",
    "browsing-topics=()",
    "clipboard-read=()",
    "clipboard-write=()",
    "serial=()",
    "hid=()",
    "xr-spatial-tracking=()",
    "screen-wake-lock=()",
    "fullscreen=()",
    "autoplay=()",
    "encrypted-media=()",
    "picture-in-picture=()",
    "interest-cohort=()",
    "idle-detection=()",
    "window-management=()",
    "document-domain=()",
    "web-share=()",
    "otp-credentials=()",
    "unload=()",
)


def validate_permissions_policy(policy: str) -> bool:
    if not isinstance(policy, str):
        return False
    if not policy or any(ord(ch) < 32 for ch in policy):
        return False
    return all(feature in policy for feature in REQUIRED_PERMISSIONS_FEATURES)


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
