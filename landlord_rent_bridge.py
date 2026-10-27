"""Flagged read-only rent ledger evaluation behind the landlord vertical.

Default off. Never imports payment gateways or bank writers. Imports
landlordos.rent_ledger only when the flag and vertical are on and the
caller supplies library-shaped charge records.
"""

from __future__ import annotations

import os


def _vertical_on() -> bool:
    try:
        from vertical_profile import is_landlord
    except ImportError:
        return False
    return bool(is_landlord())


def _enabled() -> bool:
    return os.getenv("RENT_LEDGER_ENABLE", "").strip().lower() == "true" and _vertical_on()


def _library_records(charges) -> bool:
    return any(
        isinstance(item, dict) and item.get("tenancy_id") and item.get("charge_date")
        for item in charges
    )


def _try_import_rent_ledger():
    try:
        from landlordos.rent_ledger import evaluate_rent_ledger

        return evaluate_rent_ledger
    except Exception:
        return None


def _library_eval(charges, transactions):
    evaluate = _try_import_rent_ledger()
    if evaluate is None:
        return False
    tenancy_id = next(item["tenancy_id"] for item in charges if item.get("tenancy_id"))
    result = evaluate(
        tenancy_id=tenancy_id,
        charges=charges,
        transactions=transactions,
    )
    return {
        "read_only": True,
        "arrears": float(result.balance),
        "total_charged": float(result.expected_rent),
        "total_paid": float(result.received_rent),
        "is_payment_execution": bool(result.is_payment_execution),
        "source": "landlordos.rent_ledger",
    }


def rent_ledger_evaluation(charges=None, transactions=None):
    if not _enabled():
        return False
    charges = list(charges or [])
    transactions = list(transactions or [])
    if _library_records(charges):
        return _library_eval(charges, transactions)
    total_charged = sum(float(item.get("amount", 0) or 0) for item in charges)
    total_paid = sum(float(item.get("amount", 0) or 0) for item in transactions)
    return {
        "read_only": True,
        "arrears": total_charged - total_paid,
        "total_charged": total_charged,
        "total_paid": total_paid,
        "is_payment_execution": False,
        "source": "synthetic_arithmetic",
    }
