# mos-1028-audit-slack-token-redact

## Goal
Redact Slack tokens (xox…) in audit_text.redact_detail so AuditEvent.detail cannot store them.

## Acceptance
- xox… tokens become [REDACTED]
- tests/test_audit_slack_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
