# mos-1028-audit-github-fine-pat-redact

## Goal
Redact GitHub fine-grained PATs (github_pat_…) in audit_text.redact_detail.

## Acceptance
- github_pat_… tokens become [REDACTED]
- tests/test_audit_github_fine_pat_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
