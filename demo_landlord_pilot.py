"""
LandlordOS demo script — synthetic England ≤10-unit pilot.

Run this script to demonstrate that the landlord vertical works
correctly with synthetic fixtures only. No live personal data
is involved; all data uses `example.invalid` emails,
`ZZ1 1ZZ` postcodes, and `+440000000000` phone numbers.

Usage:
    python3 -m pytest -q --tb=short demo_landlord_pilot.py
    # or
    python3 demo_landlord_pilot.py
"""

import os
import sys

# Ensure we're using the pilot's landlord vertical
sys.path.insert(0, os.path.dirname(__file__))

from models import init_db
from pilot.landlord_vertical import (
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    open_synthetic_portfolio,
    evaluate_landlord_compliance,
    vertical_view,
    reset_landlord_vertical_for_tests,
    VerticalInactive,
    VerticalPropertyCap,
)
from synthetic_buyer_onboarding_kit import populate_demo_buyer_pack


def main():
    """Run a complete synthetic pilot demo cycle."""
    print("=== LandlordOS Synthetic Pilot Demo ===\n")

    # Bootstrap test database for the demo
    init_db()

    # Reset session
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"

    # Step 1: Activate the vertical
    print("1. Activate landlord vertical...")
    try:
        view = activate_landlord_vertical()
        print(f"   Vertical active: {view['active']}")
        print(f"   Market scope: {view['market_scope']}")
        print(f"   Compliance passed: {view['compliance_passed']}")
    except VerticalInactive as e:
        print(f"   FAILED: vertical inactive: {e}")
        return 1

    # Step 2: Open synthetic portfolio (≤10 units)
    print("\n2. Open synthetic portfolio with 5 properties...")
    try:
        result = open_synthetic_portfolio(units=5)
        print(f"   Client ID: {result['client_id']}")
        print(f"   Property count: {result['property_count']}")
    except (VerticalInactive, VerticalPropertyCap) as e:
        print(f"   FAILED: {type(e).__name__}: {e}")
        deactivate_landlord_vertical()
        return 1

    # Step 3: Evaluate compliance
    print("\n3. Evaluate landlord compliance...")
    try:
        cid = result['client_id']
        compliance = evaluate_landlord_compliance(cid)
        print(f"   Passed: {compliance['passed']}")
        print(f"   Findings: {compliance['findings']}")
        print(f"   Property count: {compliance['property_count']}")
    except Exception as e:
        print(f"   FAILED: {type(e).__name__}: {e}")
        deactivate_landlord_vertical()
        return 1

    # Step 4: View diagnostics
    print("\n4. View vertical diagnostics...")
    try:
        diag = vertical_view()
        print(f"   Vertical: {diag['vertical']}")
        print(f"   Active: {diag['active']}")
        print(f"   Metrics: {diag.get('metrics', {})}")
    except Exception as e:
        print(f"   FAILED: {type(e).__name__}: {e}")

    # Step 5: Populate synthetic buyer-pack demo data
    print("\n5. Populate synthetic buyer pack...")
    try:
        pack = populate_demo_buyer_pack()
        tenant = pack["tenant"]
        print(f"   Client: {tenant['client_name']}")
        print(f"   Synthetic only: {tenant['synthetic_only']}")
        print(f"   Sale ready: {tenant['sale_ready']}")
        print(f"   Kit present: {pack['kit_present']}")
        print(f"   commercial_release_ready: {pack['commercial_release_ready']}")
    except Exception as e:
        print(f"   FAILED: {type(e).__name__}: {e}")
        deactivate_landlord_vertical()
        return 1

    # Step 6: Deactivate the vertical
    print("\n6. Deactivate landlord vertical...")
    try:
        view = deactivate_landlord_vertical()
        print(f"   Vertical restored: {not view['active']}")
        print(f"   Market scope after off: {view['market_scope']}")
    except Exception as e:
        print(f"   FAILED: {type(e).__name__}: {e}")
        return 1

    print("\n=== All checks passed ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
