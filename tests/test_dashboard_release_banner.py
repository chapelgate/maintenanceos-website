from pathlib import Path

import readiness


def test_release_status_banner_warns_when_not_ready():
    banner = readiness.release_status_banner({"commercial_release_ready": False})
    assert banner["level"] == "warning"
    assert "NOT COMMERCIALLY RELEASED" in banner["title"]
    assert "SYNTHETIC ONLY" in banner["body"]
    assert "No sale" in banner["body"]
    assert "live personal data" in banner["body"]


def test_release_status_banner_info_when_ready_flag_true():
    banner = readiness.release_status_banner({"commercial_release_ready": True})
    assert banner["level"] == "info"
    assert "Commercial release flag is true" in banner["title"]
    assert "last gates" in banner["body"].lower()


def test_live_report_banner_matches_commercial_flag_and_dashboard_calls_it():
    report = readiness.report()
    banner = readiness.release_status_banner(report)
    if report["commercial_release_ready"]:
        assert banner["level"] == "info"
    else:
        assert banner["level"] == "warning"
    dashboard = Path(__file__).resolve().parents[1] / "dashboard.py"
    text = dashboard.read_text(encoding="utf-8")
    assert "release_status_banner" in text
    assert 'st.warning(f"{banner' in text or "st.warning" in text
