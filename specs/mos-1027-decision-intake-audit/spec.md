# mos-1027-decision-intake-audit

## Goal
Fail closed and redact when decision_engine writes INTAKE_CLASSIFIED audit detail.

## Acceptance
- decision_engine.INTAKE_AUDIT_DETAIL_MAX == 8000
- bound_intake_audit_detail redacts secrets and rejects overlong JSON
- tests/test_decision_intake_audit.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
