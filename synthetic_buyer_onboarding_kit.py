from __future__ import annotations

from pathlib import Path
from typing import Any

from tenant_security import SYNTHETIC_MODE

KIT_DOC = Path("docs/commercial_release/SYNTHETIC_BUYER_ONBOARDING_KIT.md")

REQUIRED_STEP_FIELDS = (
    "checkout_sha",
    "readiness_false",
    "local_pytest",
    "synthetic_sqlite_only",
    "no_pstn_call",
    "no_live_pii",
)

_BUYER_CLIENT = "SYNTHETIC BUYER PACK CLIENT - NOT A REAL CLIENT"
_BUYER_EMAIL = "synthetic-buyer@example.invalid"
_BUYER_PHONE = "+440000000000"
_BUYER_POSTCODE = "ZZ9 9ZZ"
_BUYER_ADDRESS = "SYNTHETIC BUYER ADDRESS - NO REAL ADDRESS"


def kit_doc_path() -> Path:
    return KIT_DOC


def required_step_fields() -> tuple[str, ...]:
    return REQUIRED_STEP_FIELDS


def synthetic_buyer_tenant() -> dict[str, Any]:
    return {
        "mode": SYNTHETIC_MODE,
        "client_name": _BUYER_CLIENT,
        "contact_email": _BUYER_EMAIL,
        "contact_phone": _BUYER_PHONE,
        "property_address": _BUYER_ADDRESS,
        "property_postcode": _BUYER_POSTCODE,
        "sale_ready": False,
        "live_pii": False,
        "synthetic_only": True,
    }


def assert_synthetic_buyer_tenant(payload: dict[str, Any] | None = None) -> bool:
    data = synthetic_buyer_tenant() if payload is None else payload
    if data.get("mode") != SYNTHETIC_MODE:
        raise AssertionError("buyer tenant mode must be SYNTHETIC_TEST")
    if not str(data.get("contact_email", "")).endswith(".invalid"):
        raise AssertionError("buyer email must use .invalid")
    if not str(data.get("property_postcode", "")).startswith("ZZ"):
        raise AssertionError("buyer postcode must use ZZ test range")
    if "SYNTHETIC" not in str(data.get("client_name", "")):
        raise AssertionError("buyer client_name must mark SYNTHETIC")
    if data.get("sale_ready") is not False:
        raise AssertionError("sale_ready must stay False")
    if data.get("live_pii") is not False:
        raise AssertionError("live_pii must stay False")
    if data.get("synthetic_only") is not True:
        raise AssertionError("synthetic_only must be True")
    return True


def populate_demo_buyer_pack() -> dict[str, Any]:
    tenant = synthetic_buyer_tenant()
    assert_synthetic_buyer_tenant(tenant)
    return {
        "tenant": tenant,
        "kit_doc": str(KIT_DOC),
        "kit_present": KIT_DOC.is_file(),
        "required_step_fields": list(REQUIRED_STEP_FIELDS),
        "commercial_release_ready": False,
    }
