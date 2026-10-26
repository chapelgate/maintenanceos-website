"""England private pilot caps for vertical=landlord.

Fail-closed guards applied at property create/list call sites only:

- property create/list capped at 10 units per client when vertical=landlord
- landlord vertical requires market scope uk-non-social-housing;
  social-housing (england-social-housing) stays false
- readiness stays false unless LANDLORD_PILOT_DATA_MODE=synthetic
- vertical=off leaves existing property limits unchanged

Stdlib + existing models only. No new service, queue, database or heavy dependency.
"""

from __future__ import annotations

import os

from models import Property, SessionLocal

LANDLORD_PILOT_CAP = 10
LANDLORD_VERTICAL = "landlord"
WORKSMARTOS_PROFILE = "worksmartos"
LANDLORD_MARKET_SCOPE = "uk-non-social-housing"
SOCIAL_MARKET_SCOPE = "england-social-housing"
LANDLORD_PILOT_DATA_MODE = "synthetic"
DEFAULT_VERTICAL = "none"


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip().lower()


def _is_landlord_vertical_attempted() -> bool:
    """True when WORKSMART_VERTICAL=landlord (regardless of PRODUCT_PROFILE)."""
    return _env("WORKSMART_VERTICAL") == LANDLORD_VERTICAL


def is_landlord_vertical() -> bool:
    """True only when WORKSMART_VERTICAL=landlord AND PRODUCT_PROFILE=worksmartos."""
    return _is_landlord_vertical_attempted() and _env("PRODUCT_PROFILE") == WORKSMARTOS_PROFILE


def is_vertical_off() -> bool:
    return not _is_landlord_vertical_attempted()


def landlord_market_scope_ok() -> bool:
    """Explicit non-social market scope required; social-housing stays false."""
    scope = _env("COMMERCIAL_MARKET_SCOPE")
    if scope == SOCIAL_MARKET_SCOPE:
        return False
    return scope == LANDLORD_MARKET_SCOPE


def landlord_pilot_data_mode_ok() -> bool:
    return _env("LANDLORD_PILOT_DATA_MODE") == LANDLORD_PILOT_DATA_MODE


def is_landlord_pilot_ready() -> bool:
    """Readiness is false unless landlord vertical + non-social scope + synthetic data."""
    if not is_landlord_vertical():
        return False
    return landlord_market_scope_ok() and landlord_pilot_data_mode_ok()


def landlord_property_count(client_id: int) -> int:
    with SessionLocal() as session:
        return session.query(Property).filter_by(client_id=client_id).count()


def can_create_landlord_property(client_id: int) -> bool:
    """Guard for the property create call site."""
    if is_vertical_off():
        return True
    if not is_landlord_vertical():
        return False
    if not landlord_market_scope_ok():
        return False
    if not landlord_pilot_data_mode_ok():
        return False
    return landlord_property_count(client_id) < LANDLORD_PILOT_CAP


def can_list_landlord_properties(client_id: int) -> bool:
    """Guard for the property list call site."""
    if is_vertical_off():
        return True
    if not is_landlord_vertical():
        return False
    if not landlord_market_scope_ok():
        return False
    if not landlord_pilot_data_mode_ok():
        return False
    return landlord_property_count(client_id) <= LANDLORD_PILOT_CAP


def landlord_create_refusal_reason(client_id: int) -> str | None:
    """Human-readable reason create is blocked, or None when allowed."""
    if is_vertical_off():
        return None
    if not is_landlord_vertical():
        return "Landlord vertical is not configured with PRODUCT_PROFILE=worksmartos."
    if not landlord_market_scope_ok():
        return "Landlord pilot requires COMMERCIAL_MARKET_SCOPE=uk-non-social-housing."
    if not landlord_pilot_data_mode_ok():
        return "Landlord pilot readiness requires LANDLORD_PILOT_DATA_MODE=synthetic."
    if landlord_property_count(client_id) >= LANDLORD_PILOT_CAP:
        return f"Landlord pilot property cap reached ({LANDLORD_PILOT_CAP} max)."
    return None


def landlord_list_refusal_reason(client_id: int) -> str | None:
    """Human-readable reason list is blocked, or None when allowed."""
    if is_vertical_off():
        return None
    if not is_landlord_vertical():
        return "Landlord vertical is not configured with PRODUCT_PROFILE=worksmartos."
    if not landlord_market_scope_ok():
        return "Landlord pilot requires COMMERCIAL_MARKET_SCOPE=uk-non-social-housing."
    if not landlord_pilot_data_mode_ok():
        return "Landlord pilot readiness requires LANDLORD_PILOT_DATA_MODE=synthetic."
    if landlord_property_count(client_id) > LANDLORD_PILOT_CAP:
        return f"Landlord pilot property cap reached ({LANDLORD_PILOT_CAP} max)."
    return None