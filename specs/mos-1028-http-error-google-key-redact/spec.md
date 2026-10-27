# mos-1028-http-error-google-key-redact

## Goal
Redact Google API keys (AIza…) in HTTP error details via sanitize_http_detail.

## Acceptance
- AIza-shaped keys become [REDACTED]
- tests/test_http_error_google_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
