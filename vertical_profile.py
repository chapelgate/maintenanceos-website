"""WorkSmartOS vertical profile selector.

Fail-closed selector for WORKSMART_VERTICAL ∈ {none, landlord}.
Only allows 'landlord' when PRODUCT_PROFILE=worksmartos.
"""

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
])


def _get_env(key: str, default: str = "") -> str:
    """Get environment variable, stripped."""
    return os.getenv(key, default).strip()


def _check_overlay_keys() -> None:
    """Check for overlay keys and warn if set (they are rejected/ignored)."""
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
    """Get the current vertical, fail-closed to 'none'."""
    _check_overlay_keys()
    product_profile = _get_env("PRODUCT_PROFILE")
    vertical = _get_env("WORKSMART_VERTICAL", DEFAULT_VERTICAL).lower()

    if vertical not in VALID_VERTICALS:
        return DEFAULT_VERTICAL

    if vertical == "landlord" and product_profile != "worksmartos":
        return DEFAULT_VERTICAL

    return vertical


def is_landlord() -> bool:
    """Check if current vertical is landlord."""
    return get_vertical() == "landlord"


def is_worksmartos() -> bool:
    """Check if PRODUCT_PROFILE is worksmartos."""
    return _get_env("PRODUCT_PROFILE") == "worksmartos"