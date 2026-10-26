import os

import pytest

from pilot.landlord_vertical import (
    VerticalErrorCode,
    VerticalInactive,
    VerticalPropertyCap,
    VerticalComplianceError,
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    evaluate_landlord_compliance,
    get_vertical_diagnostics,
    get_vertical_metrics,
    open_synthetic_portfolio,
    reset_landlord_vertical_for_tests,
    vertical_view,
)


def test_inactive_vertical_has_error_code():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "none"
    try:
        activate_landlord_vertical()
    except VerticalInactive as exc:
        assert exc.error_code == VerticalErrorCode.INACTIVE
        assert exc.vertical == "none"
    else:
        pytest.fail("expected VerticalInactive")


def test_cap_exceeded_has_error_code():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    activate_landlord_vertical()
    try:
        open_synthetic_portfolio(units=11)
    except VerticalPropertyCap as exc:
        assert exc.error_code == VerticalErrorCode.PROPERTY_CAP
        assert exc.requested == 11
        assert exc.limit == 10
    else:
        pytest.fail("expected VerticalPropertyCap")
    finally:
        deactivate_landlord_vertical()


def test_zero_units_raises_inactive():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    try:
        open_synthetic_portfolio(units=0)
    except VerticalInactive:
        pass
    except Exception as exc:
        pytest.fail(f"wrong exception {type(exc).__name__}: {exc}")
    else:
        pytest.fail("expected VerticalInactive")


def test_metrics_record_activations_and_deactivations():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    before = get_vertical_metrics()
    activate_landlord_vertical()
    after = get_vertical_metrics()
    assert after["activations"] == before["activations"] + 1
    deactivate_landlord_vertical()
    after2 = get_vertical_metrics()
    assert after2["deactivations"] == before["deactivations"] + 1


def test_vertical_view_includes_metrics():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "none"
    view = vertical_view()
    assert "metrics" in view
    assert isinstance(view["metrics"], dict)
    assert "activations" in view["metrics"]


def test_diagnostics_include_session_and_metrics():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    diag = get_vertical_diagnostics()
    assert "vertical" in diag
    assert "session" in diag
    assert "metrics" in diag
    assert diag["session"]["client_id"] is None


def test_compliance_failed_has_error_code():
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    activate_landlord_vertical()
    try:
        open_synthetic_portfolio(units=1)
        report = evaluate_landlord_compliance(999999)
        assert report["passed"] is False
        assert len(report["findings"]) > 0
    finally:
        deactivate_landlord_vertical()