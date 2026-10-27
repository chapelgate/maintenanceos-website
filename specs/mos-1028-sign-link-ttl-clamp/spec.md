# mos-1028-sign-link-ttl-clamp

## Goal
Make sign_link default expiry use contractor_link_ttl_seconds so out-of-range CONTRACTOR_LINK_TTL_SECONDS cannot bypass the clamped TTL bounds.

## Acceptance
- sign_link uses contractor_link_ttl_seconds() when expires_at is None
- overlong env TTL falls back to CONTRACTOR_LINK_TTL_DEFAULT on signed tokens
- tests/test_contractor_link_ttl.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
