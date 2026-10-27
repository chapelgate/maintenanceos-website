# mos-1028-permissions-policy-expand

## Goal
Expand Permissions-Policy so browser powerful features beyond camera/mic/geo stay denied by default on every HTTP response.

## Acceptance
- SECURITY_HEADERS permissions-policy includes payment, usb, bluetooth, sensors, midi, display-capture, browsing-topics denied
- /health carries the expanded header
- tests/test_permissions_policy_expand.py and test_security_headers_lock.py pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
