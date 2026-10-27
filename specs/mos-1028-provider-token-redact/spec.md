# mos-1028-provider-token-redact

## Goal
Redact SendGrid API keys, DigitalOcean PATs, GitLab PATs, and Hugging Face tokens across HTTP errors, audit detail, and operational logs.

## Acceptance
- SG./dop_v1_/glpat-/hf_ samples become [REDACTED] in all three redactors
- tests/test_provider_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
