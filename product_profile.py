import os


class ProductProfileError(Exception):
    pass


ALLOWED_PROFILES = {"maintenanceos", "worksmartos"}
DENY_KEYS = {
    "retention",
    "voice",
    "telephony",
    "market",
    "dispatch",
    "credential",
    "deploy",
    "nginx",
    "golden_line",
    "secret",
    "production",
}


def _profile_from_env() -> str:
    value = os.getenv("PRODUCT_PROFILE", "").strip().lower()
    if not value:
        return "maintenanceos"
    if value not in ALLOWED_PROFILES:
        raise ProductProfileError(f"Unknown product profile: {value}")
    return value


def profile() -> str:
    return _profile_from_env()


def profile_ready() -> bool:
    try:
        _profile_from_env()
        return True
    except ProductProfileError:
        return False


def _current_profile() -> str:
    return _profile_from_env()


def api_title() -> str:
    profile = _current_profile()
    if profile == "worksmartos":
        return "WorkSmart OS"
    return "MaintenanceOS V1 Pilot"


def page_title() -> str:
    profile = _current_profile()
    if profile == "worksmartos":
        return "WorkSmart OS"
    return "MaintenanceOS V1"


def worker_banner() -> str:
    profile = _current_profile()
    if profile == "worksmartos":
        return "WorkSmart OS worker running"
    return "MaintenanceOS V1 worker running"


def validate_overlay(overlay: dict) -> None:
    for key in overlay:
        if key in DENY_KEYS:
            raise ProductProfileError(f"Overlay key '{key}' is not permitted")
