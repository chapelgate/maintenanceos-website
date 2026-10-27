# mos-1028-permissions-policy-clipboard

## Goal
Deny clipboard-read and clipboard-write via expanded Permissions-Policy.

## Acceptance
- SECURITY_HEADERS permissions-policy includes clipboard-read=(), clipboard-write=()
- lock + dedicated tests pass
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
