# mos-1028-audit-pem-redact

## Goal
Redact PEM private keys in audit_text.redact_detail so AuditEvent.detail cannot store them.

## Acceptance
- BEGIN/END PRIVATE KEY blocks become [REDACTED]
- tests/test_audit_pem_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
