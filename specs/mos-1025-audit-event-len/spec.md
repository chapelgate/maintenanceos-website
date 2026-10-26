# mos-1025-audit-event-len: audit event names stay at most 100 characters

## Goal
Audit event names written through operations.audit are stripped and at most 100 characters, matching AuditEvent.event String(100). Empty and overlong events fail closed with ValueError before AuditEvent is added.

## Acceptance
- `tests/test_audit_event_len.py::test_audit_event_max_is_100` passes.
- `tests/test_audit_event_len.py::test_audit_event_accepts_bounded_text` passes.
- `tests/test_audit_event_len.py::test_audit_event_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
