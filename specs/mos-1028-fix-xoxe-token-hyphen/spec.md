# mos-1028-fix-xoxe-token-hyphen

## Goal
Allow hyphens inside Slack xoxe token bodies so xoxe-1-… values redact across HTTP/audit/ops redactors.

## Acceptance
- XOXE_TOKEN matches hyphenated bodies in all three redactors
- tests/test_generic_secret_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
