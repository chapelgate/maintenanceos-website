# mos-1028-permissions-policy-media

## Goal
Extend Permissions-Policy to deny autoplay, encrypted-media, picture-in-picture, idle-detection, window-management, and web-share.

## Acceptance
- SECURITY_HEADERS permissions-policy includes those denies
- tests/test_permissions_policy_media.py passes
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
