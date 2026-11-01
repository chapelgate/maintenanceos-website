import os
import warnings

VALID_VERTICALS = {"none", "landlord"}
DEFAULT_VERTICAL = "none"

OVERLAY_KEYS = frozenset([
    "WORKSMART_RETENTION",
    "WORKSMART_VOICE",
    "WORKSMART_TELEPHONY",
    "WORKSMART_MARKET",
    "WORKSMART_DISPATCH",
    "WORKSMART_CREDENTIALS",
    "WORKSMART_DEPLOY",
    "WORKSMART_NGINX",
    "WORKSMART_GOLDEN_LINE",
    "WORKSMART_SECRET",
    "WORKSMART_PRODUCTION",
])


def _get_env(key: str, default: str = "") -> str:
    try:
        raw = os.getenv(key, default)
    except ValueError:
        return ""
    value = raw.strip()
    if any(ord(ch) < 32 for ch in value):
        return ""
    return value


def _check_overlay_keys() -> None:
    for key in OVERLAY_KEYS:
        value = os.getenv(key)
        if value is not None and value.strip():
            warnings.warn(
                f"Overlay key {key} is set but ignored; "
                f"vertical is controlled by WORKSMART_VERTICAL and PRODUCT_PROFILE only",
                RuntimeWarning,
                stacklevel=3,
            )


def get_vertical() -> str:
    _check_overlay_keys()
    product_profile = _get_env("PRODUCT_PROFILE")
    vertical = _get_env("WORKSMART_VERTICAL", DEFAULT_VERTICAL).lower()

    if vertical not in VALID_VERTICALS:
        return DEFAULT_VERTICAL

    if vertical == "landlord" and product_profile != "worksmartos":
        return DEFAULT_VERTICAL

    return vertical


def is_landlord() -> bool:
    return get_vertical() == "landlord"


def is_worksmartos() -> bool:
    return _get_env("PRODUCT_PROFILE") == "worksmartos"
