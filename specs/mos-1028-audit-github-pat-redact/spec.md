# mos-1028-audit-github-pat-redact

## Goal
Redact GitHub PATs (ghp_…) in audit_text.redact_detail so AuditEvent.detail cannot store them.

## Acceptance
- ghp_… tokens become [REDACTED]
- tests/test_audit_github_pat_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
