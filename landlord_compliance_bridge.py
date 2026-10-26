"""Fail-closed landlord compliance import/readiness helpers.

Imports only stdlib + vertical_profile (local). Reads WORKSMART_VERTICAL from
env directly; never imports `landlordos` unless the vertical is landlord. On
missing dependency returns readiness false without crashing.

evaluate_compliance() calls landlordos.compliance on an allowlisted synthetic
England context. Disallowed input keys are removed before that call. The
returned dict keeps structured facts and drops free-text legal conclusions
and deadline dates.
"""

import os
import re
from vertical_profile import get_vertical as vp_get_vertical

DEFAULT_VERTICAL = "none"
LANDLORD_VERTICAL = "landlord"

ALLOWLISTED_SYNTHETIC_KEYS = {
    "id",
    "postcode",
    "property_ref",
}

DISALLOWED_KEYS = {
    "special_category",
    "contact_dump",
    "access_code",
    "ssn",
    "medical_record",
    "full_name",
    "date_of_birth",
}

_BLOCKED_RESULT_KEYS = frozenset({
    "advice",
    "conclusion",
    "conclusions",
    "deadline",
    "deadlines",
    "due",
    "due_date",
    "due_dates",
    "expiry",
    "expiry_date",
    "expires",
    "legal_advice",
    "legal_conclusion",
    "notice",
    "recommendation",
    "recommendations",
    "serve_by",
})

_DATE_VALUE = re.compile(
    r"^(?:\d{4}-\d{2}-\d{2}(?:[tT ][0-2]\d:[0-5]\d(?::[0-5]\d)?(?:Z|[+-][0-2]\d:?[0-5]\d)?)?|\d{2}/\d{2}/\d{4})$"
)

_DROP = object()


class LandlordComplianceError(RuntimeError):
    """Raised when landlord compliance evaluation cannot run."""

    pass


def get_vertical() -> str:
    """Return current vertical, fail-closed to 'none' on anything invalid."""
    return vp_get_vertical()


def is_landlord() -> bool:
    """Return True only when WORKSMART_VERTICAL is exactly 'landlord'."""
    return get_vertical() == LANDLORD_VERTICAL


def _try_import_landlordos_compliance():
    """Return landlordos.compliance, or None when the import fails."""
    try:
        import landlordos.compliance as mod
        return mod
    except Exception:
        return None


def is_landlord_compliance_ready() -> bool:
    """Return True only when vertical is landlord AND landlordos.compliance imports."""
    if not is_landlord():
        return False
    return _try_import_landlordos_compliance() is not None


def compliance_module():
    """Return landlordos.compliance module when available, else None (fail closed)."""
    if not is_landlord():
        return None
    return _try_import_landlordos_compliance()


def strip_disallowed_fields(data: dict) -> dict:
    """Return a copy of data with all DISALLOWED_KEYS removed."""
    return {k: v for k, v in data.items() if k not in DISALLOWED_KEYS}


def strip_to_allowlist(data: dict) -> dict:
    """Return a copy of data containing only ALLOWLISTED_SYNTHETIC_KEYS."""
    return {k: v for k, v in data.items() if k in ALLOWLISTED_SYNTHETIC_KEYS}


def _blocked_result_key(key) -> bool:
    if not isinstance(key, str):
        return True
    normalised = key.strip().lower().replace("-", "_").replace(" ", "_")
    if normalised in _BLOCKED_RESULT_KEYS:
        return True
    return (
        "deadline" in normalised
        or "conclusion" in normalised
        or "legal_advice" in normalised
        or normalised.endswith("_due")
        or normalised.endswith("_due_date")
    )


def _filter_fact(value):
    if isinstance(value, bool) or value is None or isinstance(value, (int, float)):
        return value
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped or any(ch.isspace() for ch in value) or _DATE_VALUE.fullmatch(stripped):
            return _DROP
        return value
    if isinstance(value, list):
        kept = []
        for item in value:
            filtered = _filter_fact(item)
            if filtered is _DROP:
                continue
            kept.append(filtered)
        return kept
    if isinstance(value, dict):
        return _structured_facts(value)
    return _DROP


def _structured_facts(result: dict) -> dict:
    facts = {}
    for key, value in result.items():
        if _blocked_result_key(key):
            continue
        filtered = _filter_fact(value)
        if filtered is _DROP:
            continue
        if isinstance(filtered, dict) and not filtered:
            continue
        facts[key] = filtered
    return facts


def evaluate_compliance(raw_input: dict) -> dict:
    """Evaluate an allowlisted synthetic context and return structured facts.

    Raises LandlordComplianceError when the vertical is not landlord, the
    dependency is unavailable, or the dependency result is not a dict.
    """
    if not is_landlord():
        raise LandlordComplianceError("not in landlord vertical")

    module = _try_import_landlordos_compliance()
    if module is None:
        raise LandlordComplianceError("landlordos.compliance not available")

    cleaned = strip_disallowed_fields(raw_input)
    synthetic = strip_to_allowlist(cleaned)
    result = module.evaluate_compliance(synthetic)
    if not isinstance(result, dict):
        raise LandlordComplianceError("evaluate_compliance did not return a dict")
    return _structured_facts(result)


def evaluate_compliance_entrypoint():
    """Eval entrypoint for landlord compliance: raises typed error when unavailable."""
    if not is_landlord():
        raise LandlordComplianceError("not in landlord vertical")
    module = _try_import_landlordos_compliance()
    if module is None:
        raise LandlordComplianceError("landlordos.compliance not available")
    return module
