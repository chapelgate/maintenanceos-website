# mos-1028-http-error-github-fine-pat

## Goal
Redact GitHub fine-grained PATs (github_pat_…) in sanitize_http_detail.

## Acceptance
- github_pat_… tokens become [REDACTED]
- tests/test_http_error_github_fine_pat_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
