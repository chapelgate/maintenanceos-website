# mos-1028-ops-log-google-key-redact

## Goal
Redact Google API keys (AIza…) in operational_logging._redact.

## Acceptance
- AIza-shaped keys become [REDACTED] in allowed string fields
- tests/test_ops_log_google_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
