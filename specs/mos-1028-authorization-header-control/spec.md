# mos-1028-authorization-header-control

## Goal
Authorization header Bearer token rejects control characters.

## Acceptance
- require_internal_api calls _reject_control_chars on Authorization header
- tests pass