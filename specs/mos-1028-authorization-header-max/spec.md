# mos-1028-authorization-header-max

## Goal
Internal API Authorization header fails closed when longer than AUTHORIZATION_HEADER_MAX before token comparison.

## Acceptance
- AUTHORIZATION_HEADER_MAX == 512
- overlong Authorization returns 401 without comparing secrets
- tests/test_authorization_header_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
