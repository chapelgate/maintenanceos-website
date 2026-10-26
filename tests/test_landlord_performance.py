import os
import time

import pytest

from pilot.landlord_vertical import (
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    open_synthetic_portfolio,
    evaluate_landlord_compliance,
    get_vertical_metrics,
    reset_landlord_vertical_for_tests,
)


def test_portfolio_open_latency_under_threshold_ms():
    """Performance gate: opening a synthetic portfolio completes fast."""
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    try:
        activate_landlord_vertical()
        start = time.monotonic()
        open_synthetic_portfolio(units=10)
        elapsed_ms = (time.monotonic() - start) * 1000
        assert elapsed_ms < 5000, f"portfolio open took {elapsed_ms:.1f}ms (>5000ms)"
    finally:
        deactivate_landlord_vertical()


def test_compliance_check_latency_under_threshold_ms():
    """Performance gate: compliance evaluation completes fast."""
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    try:
        activate_landlord_vertical()
        result = open_synthetic_portfolio(units=10)
        start = time.monotonic()
        evaluate_landlord_compliance(result["client_id"])
        elapsed_ms = (time.monotonic() - start) * 1000
        assert elapsed_ms < 5000, f"compliance check took {elapsed_ms:.1f}ms (>5000ms)"
    finally:
        deactivate_landlord_vertical()


def test_repeated_activations_stable_metrics():
    """Performance: repeated activate/deactivate cycles stay bounded."""
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    try:
        for _ in range(10):
            os.environ["WORKSMART_VERTICAL"] = "landlordos"
            activate_landlord_vertical()
            deactivate_landlord_vertical()
        metrics = get_vertical_metrics()
        assert metrics["activations"] == 10
        assert metrics["deactivations"] == 10
    finally:
        deactivate_landlord_vertical()