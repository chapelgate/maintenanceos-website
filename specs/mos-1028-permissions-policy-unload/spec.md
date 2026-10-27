# mos-1028-permissions-policy-unload

## Goal
Deny the unload Permissions-Policy feature on HTTP responses.

## Acceptance
- SECURITY_HEADERS permissions-policy includes unload=()
- dedicated pytest passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
