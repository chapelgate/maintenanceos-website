from pathlib import Path

import operational_logging as ol
import readiness

DOC = Path(__file__).resolve().parents[1] / "docs" / "commercial_release" / "LOCAL_OBSERVABILITY_HONESTY.md"


def test_structured_logging_defaults_off_and_does_not_propagate(monkeypatch):
    monkeypatch.delenv("ENABLE_STRUCTURED_LOGGING", raising=False)
    assert ol.structured_logging_enabled() is False
    assert ol.LOGGER.propagate is False
    assert any(isinstance(handler, type(ol.LOGGER.handlers[0])) for handler in ol.LOGGER.handlers)


def test_honesty_doc_rejects_central_monitoring_claim():
    text = DOC.read_text(encoding="utf-8")
    assert "PROCESS-LOCAL ONLY" in text
    assert "NOT CENTRAL MONITORING" in text
    assert "tamper-resistant" in text.lower()


def test_readiness_report_has_no_central_monitoring_ready_true():
    report = readiness.report()
    assert "central_monitoring_ready" not in report
    assert report.get("structured_logging") is False
    assert report["commercial_release_ready"] is False
