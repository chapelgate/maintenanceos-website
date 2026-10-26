# mos-04-audit-detail: Redact secrets in audit detail text

## Goal
Stop raw emails, phone numbers, bearer tokens, OpenAI-style keys, and provider ids reaching `AuditEvent.detail`.

## Acceptance
- `audit_text.redact_detail` applies the same bearer, `sk-`, email, E.164 phone, and provider-id substitutions already used by operational logging.
- JSON keys `client_id`, `request_id`, `job_id`, and `hold_id`, and their integer values, stay intact.
- `operations.audit` stores `redact_detail(detail)` and changes no other operation.
- `tests/test_audit_text.py::test_email_phone_and_bearer_are_redacted` passes.
- `tests/test_audit_text.py::test_lifecycle_ids_survive` passes.
- `tests/test_audit_text.py::test_audit_helper_stores_redacted_detail` passes without importing voice modules.
- No schema change and no migration.

## Safety boundary
- Licence route: NONE. New code reusing the in-repo redaction patterns.
- No frozen paths, no `models.py`, no `migrate_schema.py`, no `operational_logging.py`.
