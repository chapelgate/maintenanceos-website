# mos-1028-x-permitted-cross-domain

## Goal
Lock X-Permitted-Cross-Domain-Policies: none on every HTTP response.

## Acceptance
- SECURITY_HEADERS includes the header
- /health carries it
- tests/test_x_permitted_cross_domain.py and lock test pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
