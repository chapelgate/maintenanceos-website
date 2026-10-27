# mos-1028-http-error-github-pat-redact

## Goal
Redact GitHub PATs (ghp_…) in HTTP error details.

## Acceptance
- ghp_-shaped tokens become [REDACTED]
- tests/test_http_error_github_pat_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
