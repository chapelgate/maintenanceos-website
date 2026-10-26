"""WorkSmartOS landlord vertical reader. mos-06 still owns the identity pin."""

from __future__ import annotations

import json
import os
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from pilot.runtime_guard import export_pilot_runtime_snapshot, restore_pilot_runtime_snapshot

VERTICAL_ENV = "WORKSMART_VERTICAL"
LANDLORD_VERTICAL = "landlordos"
VERTICAL_OFF = "none"
MAX_SYNTHETIC_PROPERTIES = 10
MARKET_SCOPE = "england_synthetic_le_10"
PLACEHOLDER_PHONE = "+440000000000"
SYNTHETIC_EMAIL_DOMAIN = "@example.invalid"
SYNTHETIC_POSTCODE = "ZZ1 1ZZ"
_SHA: str | None = None


class VerticalErrorCode:
    INACTIVE = "vertical_inactive"
    PROPERTY_CAP = "property_cap_exceeded"
    COMPLIANCE_FAILED = "compliance_failed"
    NO_PROPERTIES = "no_properties"
    HANDOFF_DESCRIPTION = "handoff_description_not_synthetic"
    HANDOFF_MISSING_REFS = "handoff_missing_property_or_resident"
    DB_ERROR = "db_error"
    SNAPSHOT_RESTORE_FAILED = "snapshot_restore_failed"
    INVALID_ARGUMENT = "invalid_argument"


class VerticalInactive(RuntimeError):
    def __init__(self, vertical: str) -> None:
        self.vertical = vertical
        self.error_code = VerticalErrorCode.INACTIVE
        super().__init__(f"vertical_inactive:{vertical}")


class VerticalPropertyCap(ValueError):
    def __init__(self, requested: int, limit: int = MAX_SYNTHETIC_PROPERTIES) -> None:
        self.requested = requested
        self.limit = limit
        self.error_code = VerticalErrorCode.PROPERTY_CAP
        super().__init__(f"property_cap_exceeded:{requested}>{limit}")


class VerticalComplianceError(RuntimeError):
    def __init__(self, findings: list[str]) -> None:
        self.findings = list(findings)
        self.error_code = VerticalErrorCode.COMPLIANCE_FAILED
        super().__init__("compliance_failed")


@dataclass
class _Session:
    active: bool = False
    baseline_encoded: str | None = None
    armed_env: str | None = None
    armed_captured: bool = False
    client_id: int | None = None
    handoff_ref: str | None = None
    compliance_passed: bool | None = None
    metrics: dict[str, int] = field(default_factory=lambda: {
        "activations": 0,
        "deactivations": 0,
        "portfolio_opens": 0,
        "compliance_checks": 0,
        "handoffs_recorded": 0,
        "errors": 0,
    })


_SESSION = _Session()


def _record_metric(key: str, increment: int = 1) -> None:
    _SESSION.metrics[key] = _SESSION.metrics.get(key, 0) + increment


def get_vertical_metrics() -> dict[str, int]:
    return dict(_SESSION.metrics)


def _normalise(raw: str | None) -> str:
    value = (raw or "").strip().lower()
    if value in {"", "none", "unset", "off"}:
        return VERTICAL_OFF
    return value


def mos_sha() -> str:
    global _SHA
    if _SHA is not None:
        return _SHA
    pinned = os.getenv("MOS_GIT_SHA", "").strip()
    if pinned:
        _SHA = pinned
        return _SHA
    try:
        _SHA = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=Path(__file__).resolve().parents[1],
            text=True,
            timeout=2,
            stderr=subprocess.DEVNULL,
        ).strip() or "UNKNOWN"
    except (OSError, subprocess.SubprocessError):
        _SHA = "UNKNOWN"
    return _SHA


def _restore_captured_baseline() -> None:
    encoded = _SESSION.baseline_encoded
    armed = _SESSION.armed_env
    captured = _SESSION.armed_captured
    _SESSION.baseline_encoded = None
    _SESSION.armed_env = None
    _SESSION.armed_captured = False
    _SESSION.active = False
    if encoded is not None:
        restore_pilot_runtime_snapshot(encoded)
    if captured:
        if armed is None:
            os.environ.pop("PILOT_MODE_ARMED", None)
        else:
            os.environ["PILOT_MODE_ARMED"] = armed


def read_worksmart_vertical() -> str:
    name = _normalise(os.getenv(VERTICAL_ENV))
    if name != LANDLORD_VERTICAL and _SESSION.baseline_encoded is not None:
        _restore_captured_baseline()
    if name != LANDLORD_VERTICAL:
        _SESSION.active = False
    return name


def vertical_view() -> dict[str, Any]:
    name = read_worksmart_vertical()
    return {
        "vertical": name,
        "active": bool(_SESSION.active and name == LANDLORD_VERTICAL),
        "market_scope": MARKET_SCOPE if name == LANDLORD_VERTICAL else "core_mos",
        "max_properties": MAX_SYNTHETIC_PROPERTIES,
        "landlordos_pin": "UNKNOWN",
        "mos_sha": mos_sha(),
        "handoff_ref": _SESSION.handoff_ref,
        "compliance_passed": _SESSION.compliance_passed,
        "metrics": get_vertical_metrics(),
    }


def get_vertical_diagnostics() -> dict[str, Any]:
    name = read_worksmart_vertical()
    return {
        "vertical": name,
        "active": bool(_SESSION.active and name == LANDLORD_VERTICAL),
        "session": {
            "client_id": _SESSION.client_id,
            "handoff_ref": _SESSION.handoff_ref,
            "compliance_passed": _SESSION.compliance_passed,
        },
        "metrics": get_vertical_metrics(),
        "env": {
            VERTICAL_ENV: name,
        },
    }


def activate_landlord_vertical() -> dict[str, Any]:
    name = _normalise(os.getenv(VERTICAL_ENV))
    if name != LANDLORD_VERTICAL:
        _record_metric("errors")
        raise VerticalInactive(name)
    if _SESSION.baseline_encoded is None:
        try:
            _SESSION.baseline_encoded = export_pilot_runtime_snapshot()
            _SESSION.armed_env = os.environ.get("PILOT_MODE_ARMED")
            _SESSION.armed_captured = True
        except Exception:
            _record_metric("errors")
            _SESSION.baseline_encoded = None
            _SESSION.armed_env = None
            _SESSION.armed_captured = False
            raise
    _SESSION.active = True
    _record_metric("activations")
    return vertical_view()


def deactivate_landlord_vertical() -> dict[str, Any]:
    os.environ[VERTICAL_ENV] = VERTICAL_OFF
    _record_metric("deactivations")
    return vertical_view()


def reset_landlord_vertical_for_tests() -> None:
    _SESSION.active = False
    _SESSION.baseline_encoded = None
    _SESSION.armed_env = None
    _SESSION.armed_captured = False
    _SESSION.client_id = None
    _SESSION.handoff_ref = None
    _SESSION.compliance_passed = None
    _SESSION.metrics = {
        "activations": 0,
        "deactivations": 0,
        "portfolio_opens": 0,
        "compliance_checks": 0,
        "handoffs_recorded": 0,
        "errors": 0,
    }


def _require_active() -> None:
    name = read_worksmart_vertical()
    if name != LANDLORD_VERTICAL or not _SESSION.active:
        raise VerticalInactive(name)


def open_synthetic_portfolio(*, units: int) -> dict[str, Any]:
    _require_active()
    _record_metric("portfolio_opens")
    import models
    from models import Client, Contractor, Property, Resident, TenantBoundary
    from tenant_security import SYNTHETIC_MODE

    with models.SessionLocal() as session:
        client_id = _SESSION.client_id
        if client_id is None:
            client = Client(
                name="SYNTHETIC VOICE TEST - NOT A REAL CLIENT",
                quote_approval_limit=0,
                invoice_variance_percent=0,
            )
            session.add(client)
            session.flush()
            client_id = int(client.id)
        existing = session.query(Property).filter_by(client_id=client_id).count() if _SESSION.client_id else 0
        projected = existing + int(units)
        if units < 1 or projected > MAX_SYNTHETIC_PROPERTIES:
            session.rollback()
            _record_metric("errors")
            raise VerticalPropertyCap(projected, MAX_SYNTHETIC_PROPERTIES)
        if _SESSION.client_id is None:
            session.add(
                TenantBoundary(
                    client_id=client_id,
                    mode=SYNTHETIC_MODE,
                    label="SYNTHETIC England landlord vertical",
                )
            )
            session.add(
                Contractor(
                    client_id=client_id,
                    name="SYNTHETIC TEST CONTRACTOR",
                    trade="Plumber",
                    postcode_coverage="ZZ1",
                    email=f"synthetic-contractor{SYNTHETIC_EMAIL_DOMAIN}",
                    qualification_summary="TEST DATA ONLY",
                    active=False,
                )
            )
            _SESSION.client_id = client_id
        for offset in range(int(units)):
            number = existing + offset + 1
            session.add(
                Property(
                    client_id=client_id,
                    address=f"SYNTHETIC LANDLORD PROPERTY {number} - NO REAL ADDRESS",
                    postcode=SYNTHETIC_POSTCODE,
                    property_type="TEST ONLY",
                    access_notes="TEST DATA ONLY",
                    emergency_notes="TEST DATA ONLY",
                )
            )
        session.flush()
        if session.query(Resident).filter_by(client_id=client_id).count() == 0:
            first = session.query(Property).filter_by(client_id=client_id).order_by(Property.id).first()
            if first is None:
                raise VerticalComplianceError(["no_properties"])
            session.add(
                Resident(
                    client_id=client_id,
                    property_id=first.id,
                    name="SYNTHETIC TEST CALLER",
                    phone=PLACEHOLDER_PHONE,
                    email=f"synthetic-resident{SYNTHETIC_EMAIL_DOMAIN}",
                    active=True,
                )
            )
        session.commit()
        stored = session.query(Property).filter_by(client_id=client_id).count()
        return {"client_id": client_id, "property_count": stored}


def evaluate_landlord_compliance(client_id: int) -> dict[str, Any]:
    _require_active()
    _record_metric("compliance_checks")
    import models
    from models import Contractor, Property, Resident, TenantBoundary
    from tenant_security import SYNTHETIC_MODE

    findings: list[str] = []
    with models.SessionLocal() as session:
        boundary = session.get(TenantBoundary, client_id)
        if boundary is None or boundary.mode != SYNTHETIC_MODE:
            findings.append("boundary_not_synthetic")
        props = session.query(Property).filter_by(client_id=client_id).all()
        if not props:
            findings.append("no_properties")
        if len(props) > MAX_SYNTHETIC_PROPERTIES:
            findings.append("property_cap_exceeded")
        for prop in props:
            address = prop.address or ""
            if "SYNTHETIC" not in address or "NO REAL ADDRESS" not in address:
                findings.append(f"property_not_synthetic:{prop.id}")
            if prop.postcode != SYNTHETIC_POSTCODE:
                findings.append(f"property_postcode_not_synthetic:{prop.id}")
            if "TEST" not in (prop.property_type or ""):
                findings.append(f"property_type_not_synthetic:{prop.id}")
        residents = session.query(Resident).filter_by(client_id=client_id).all()
        if not residents:
            findings.append("resident_missing")
        for resident in residents:
            if "SYNTHETIC" not in (resident.name or ""):
                findings.append(f"resident_name_not_synthetic:{resident.id}")
            if not str(resident.email or "").endswith(SYNTHETIC_EMAIL_DOMAIN):
                findings.append(f"resident_email_not_synthetic:{resident.id}")
            if resident.phone != PLACEHOLDER_PHONE:
                findings.append(f"resident_phone_not_placeholder:{resident.id}")
        contractors = session.query(Contractor).filter_by(client_id=client_id).all()
        for contractor in contractors:
            if "SYNTHETIC" not in (contractor.name or ""):
                findings.append(f"contractor_name_not_synthetic:{contractor.id}")
            if contractor.email and not str(contractor.email).endswith(SYNTHETIC_EMAIL_DOMAIN):
                findings.append(f"contractor_email_not_synthetic:{contractor.id}")
        stored = len(props)
    passed = not findings
    _SESSION.compliance_passed = passed
    if not passed:
        _record_metric("errors")
    return {
        "passed": passed,
        "findings": findings,
        "property_count": stored,
        "client_id": client_id,
    }


def record_maintenance_handoff(client_id: int, *, description: str) -> dict[str, Any]:
    _require_active()
    _record_metric("handoffs_recorded")
    if "SYNTHETIC" not in description:
        _record_metric("errors")
        raise VerticalComplianceError(["handoff_description_not_synthetic"])
    report = evaluate_landlord_compliance(client_id)
    if not report["passed"]:
        _record_metric("errors")
        raise VerticalComplianceError(list(report["findings"]))
    import models
    from models import AuditEvent, Property, Resident, WorkOrder

    with models.SessionLocal() as session:
        prop = session.query(Property).filter_by(client_id=client_id).order_by(Property.id).first()
        resident = session.query(Resident).filter_by(client_id=client_id).order_by(Resident.id).first()
        if prop is None or resident is None:
            raise VerticalComplianceError(["handoff_missing_property_or_resident"])
        work_order = WorkOrder(
            client_id=client_id,
            property_id=prop.id,
            resident_id=resident.id,
            description=description,
            source="SYNTHETIC",
            category="landlord_maintenance",
            trade="General",
        )
        session.add(work_order)
        session.flush()
        ref = f"SYN-HO-{work_order.id}"
        payload = {
            "ref": ref,
            "synthetic": True,
            "client_id": client_id,
            "work_order_id": work_order.id,
        }
        session.add(
            AuditEvent(
                work_order_id=work_order.id,
                actor="landlord_vertical",
                event="maintenance_handoff",
                detail=json.dumps(payload, sort_keys=True),
            )
        )
        session.commit()
    _SESSION.handoff_ref = ref
    return payload


def get_maintenance_handoff(ref: str) -> dict[str, Any] | None:
    import models
    from models import AuditEvent

    with models.SessionLocal() as session:
        rows = session.query(AuditEvent).filter_by(event="maintenance_handoff").all()
        for row in rows:
            try:
                payload = json.loads(row.detail or "{}")
            except json.JSONDecodeError:
                continue
            if isinstance(payload, dict) and payload.get("ref") == ref:
                return payload
    return None
