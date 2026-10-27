# mos-1028-ops-log-github-pat-redact

## Goal
Redact GitHub PATs (ghp_…) in operational_logging._redact.

## Acceptance
- ghp_-shaped tokens become [REDACTED]
- tests/test_ops_log_github_pat_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
