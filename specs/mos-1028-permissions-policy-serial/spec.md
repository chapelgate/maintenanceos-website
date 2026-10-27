# mos-1028-permissions-policy-serial

## Goal
Extend Permissions-Policy to deny serial, hid, xr-spatial-tracking, screen-wake-lock, and fullscreen.

## Acceptance
- SECURITY_HEADERS permissions-policy includes those denies
- tests/test_permissions_policy_serial.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
