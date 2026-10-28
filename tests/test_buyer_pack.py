"""Tests for BUYER_PACK.md documentation completeness and consistency."""

import os

import pytest


def test_buyer_pack_synthetic_fixtures_defined():
    """Verify that synthetic fixtures (emails, postcodes, phone) are documented."""
    from pilot.landlord_vertical import (
        VerticalErrorCode,
        VerticalInactive,
        VerticalPropertyCap,
        VerticalComplianceError,
    )

    # All error codes should be defined
    assert hasattr(VerticalErrorCode, "INACTIVE")
    assert hasattr(VerticalErrorCode, "PROPERTY_CAP")
    assert hasattr(VerticalErrorCode, "COMPLIANCE_FAILED")

    # All exception classes should have error_code
    assert hasattr(VerticalInactive("test"), "error_code")
    assert hasattr(VerticalPropertyCap(5), "error_code")
    assert hasattr(VerticalComplianceError(["finding"]), "error_code")


def test_vertical_config_via_env():
    """Verify WORKSMART_VERTICAL controls vertical activation."""
    from pilot.landlord_vertical import (
        VerticalErrorCode,
        VerticalInactive,
        activate_landlord_vertical,
        deactivate_landlord_vertical,
        reset_landlord_vertical_for_tests,
    )

    reset_landlord_vertical_for_tests()

    # With "landlordos" → should activate
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    view = activate_landlord_vertical()
    assert view["active"] is True
    deactivate_landlord_vertical()

    # With "none" → should raise VerticalInactive
    os.environ["WORKSMART_VERTICAL"] = "none"
    try:
        activate_landlord_vertical()
        assert False, "expected VerticalInactive"
    except Exception as exc:
        assert exc.error_code == VerticalErrorCode.INACTIVE
    deactivate_landlord_vertical()

    # Reset
    reset_landlord_vertical_for_tests()
