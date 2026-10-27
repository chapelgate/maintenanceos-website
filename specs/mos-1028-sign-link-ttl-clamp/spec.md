# mos-1028-sign-link-ttl-clamp

## Goal
Fail closed when sign_link uses contractor_link_ttl_seconds() instead of direct env access, and verify_link still enforces CONTRACTOR_LINK_TOKEN_MAX bound.

## Acceptance
- CONTRACTOR_LINK_TOKEN_MAX == 200 enforced in verify_link
- sign_link calls contractor_link_ttl_seconds() when expires_at is None
- tests pass

## Out of scope
deploy, secrets, voice, commercial runtime flags.
