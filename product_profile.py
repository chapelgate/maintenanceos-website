"""Product profile selection: MaintenanceOS or WorkSmart OS by configuration.

New code written in this repo. Copy no third-party source.
"""

import os
from typing import Mapping

_ALLOWED_PROFILES = ("maintenanceos", "worksmartos")
_DEFAULT_PROFILE = "maintenanceos"

_OVERLAY_DENY_KEYS = (
    "retention",
    "voice",
    "telephony",
    "market",
    "dispatch",
    "credential",
)

_PRESENTATION = {
    "maintenanceos": {
        "api_title": "MaintenanceOS V1 Pilot",
        "page_title": "MaintenanceOS V1",
        "worker_banner": "MaintenanceOS V1 worker running",
    },
    "worksmartos": {
        "api_title": "WorkSmart OS",
        "page_title": "WorkSmart OS",
        "worker_banner": "WorkSmart OS worker running",
    },
}


class ProductProfileError(Exception):
    pass


def _current_profile() -> str:
    return os.getenv("PRODUCT_PROFILE", "").strip() or _DEFAULT_PROFILE


def profile_ready() -> bool:
    try:
        profile()
        return True
    except ProductProfileError:
        return False


def profile(value: str | None = None) -> str:
    value = _current_profile() if value is None else value
    if value not in _ALLOWED_PROFILES:
        raise ProductProfileError(f"Unknown product profile: {value!r}")
    return value


def _reject_overlay(overlay: Mapping | None = None) -> None:
    if not overlay:
        return
    for key in overlay:
        lower = str(key).lower()
        if any(deny in lower for deny in _OVERLAY_DENY_KEYS):
            raise ProductProfileError(f"Overlay key rejected: {key}")


def api_title(overlay: Mapping | None = None) -> str:
    _reject_overlay(overlay)
    return _PRESENTATION[profile()]["api_title"]


def page_title(overlay: Mapping | None = None) -> str:
    _reject_overlay(overlay)
    return _PRESENTATION[profile()]["page_title"]


def worker_banner(overlay: Mapping | None = None) -> str:
    _reject_overlay(overlay)
    return _PRESENTATION[profile()]["worker_banner"]
