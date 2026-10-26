# mos-1025-audit-actor-len: audit actors stay at most 100 characters

## Goal
Audit actors written through operations.audit are stripped and at most 100 characters, matching AuditEvent.actor String(100). Empty and overlong actors fail closed with ValueError before AuditEvent is added.

## Acceptance
- `tests/test_audit_actor_len.py::test_audit_actor_max_is_100` passes.
- `tests/test_audit_actor_len.py::test_audit_actor_accepts_bounded_text` passes.
- `tests/test_audit_actor_len.py::test_audit_actor_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
