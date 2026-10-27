# mos-1028-fix-xoxe-token-regex

## Goal
Fix XOXE_TOKEN regex to allow hyphens in Slack xoxe tokens (format: xoxe-1-<random>).

## Acceptance
- xoxe-1-abcdef1234567890 becomes [REDACTED] in all three redactors
- tests/test_generic_secret_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
