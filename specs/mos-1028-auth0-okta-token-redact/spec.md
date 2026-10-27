# mos-1028-auth0-okta-token-redact

## Goal
Redact Auth0 and Okta tokens in HTTP errors, audit text, and operational logs.

## Acceptance
- All three redactors remove Auth0 and Okta tokens
- tests/test_auth0_okta_token_redact.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets storage, frozen paths, commercial runtime flags.
