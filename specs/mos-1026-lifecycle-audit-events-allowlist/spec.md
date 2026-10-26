# mos-1026-lifecycle-audit-events-allowlist: lifecycle audits stay on the known event set

## Goal
Lifecycle runtime audit writes go through _lifecycle_audit, which only accepts events in VALID_LIFECYCLE_AUDIT_EVENTS. Unknown events fail closed before write.

## Acceptance
- `tests/test_lifecycle_audit_events_allowlist.py::test_valid_lifecycle_audit_events_known_set` passes.
- `tests/test_lifecycle_audit_events_allowlist.py::test_create_hold_writes_allowed_audit_event` passes.
- `tests/test_lifecycle_audit_events_allowlist.py::test_lifecycle_audit_rejects_unknown_event` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
