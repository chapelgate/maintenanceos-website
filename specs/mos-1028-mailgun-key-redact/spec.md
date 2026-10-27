# mos-1028-mailgun-key-redact

## Goal
Redact Mailgun API keys (key-…) across HTTP errors, audit detail, and operational logs.

## Acceptance
- key-… samples become [REDACTED] in all three redactors
- tests/test_mailgun_key_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
