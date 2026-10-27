# mos-1028-fix-permissions-policy-unload-lock

## Goal
Update the hard-coded /health Permissions-Policy assert in test_security_headers_lock to include unload=() after #501.

## Acceptance
- tests/test_security_headers_lock.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
