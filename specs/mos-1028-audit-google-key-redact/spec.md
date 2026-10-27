# mos-1028-audit-google-key-redact

## Goal
Redact Google API keys (AIza…) in audit_text.redact_detail so AuditEvent.detail cannot store them.

## Acceptance
- AIza… keys become [REDACTED]
- tests/test_audit_google_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
