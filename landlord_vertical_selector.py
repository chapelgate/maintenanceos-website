"""Landlord vertical selector and synthetic e2e scorecard.

Determines whether a landlord vertical is active on the
MaintenanceOS maintenance config. Vertical activation is gated
behind `WORKSMART_VERTICAL=landlord` together with
`PRODUCT_PROFILE=worksmartos`. All data used here is synthetic.
"""
from __future__ import annotations

import os


VALID_VERTICALS = {"none", "landlord"}
DEFAULT_VERTICAL = "none"


def _get_env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip()


def vertical_selector() -> str:
    """Return the currently selected landlord vertical.

    Returns "landlord" only when `WORKSMART_VERTICAL=landlord` is set
    together with `PRODUCT_PROFILE=worksmartos`. Otherwise returns
    "none" (fail-closed).
    """
    product_profile = _get_env("PRODUCT_PROFILE")
    vertical = _get_env("WORKSMART_VERTICAL", DEFAULT_VERTICAL).lower()

    if vertical not in VALID_VERTICALS:
        return DEFAULT_VERTICAL

    if vertical == "landlord" and product_profile != "worksmartos":
        return DEFAULT_VERTICAL

    return vertical


def market_scope_ok() -> bool:
    scope = _get_env("COMMERCIAL_MARKET_SCOPE").lower()
    if scope == "england-social-housing":
        return False
    return scope == "uk-non-social-housing"


def synthetic_data_ok() -> bool:
    return _get_env("LANDLORD_PILOT_DATA_MODE").lower() == "synthetic"


def e2e_scorecard() -> dict:
    """Return a synthetic landlord e2e scorecard.

    All values are synthetic; no live PII or real tenant data is used.
    """
    vertical = vertical_selector()
    market_ok = market_scope_ok()
    data_ok = synthetic_data_ok()
    return {
        "vertical": vertical,
        "synthetic": True,
        "no_live_pii": True,
        "market_scope_ok": market_ok,
        "synthetic_data_ok": data_ok,
        "landlord_guard_active": vertical == "landlord" and market_ok and data_ok,
    }