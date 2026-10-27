# mos-1028-provider-secret-token-redact

## Goal
Redact SendGrid, GitLab, HuggingFace, Mailgun, and DigitalOcean tokens across all three secret redactors.

## Acceptance
- provider tokens become [REDACTED] in http_error_text, audit_text, operational_logging
- tests/test_provider_secret_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
