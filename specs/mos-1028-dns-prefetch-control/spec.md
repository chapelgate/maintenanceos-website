# mos-1028-dns-prefetch-control

## Goal
Lock X-DNS-Prefetch-Control: off on every HTTP response.

## Acceptance
- SECURITY_HEADERS includes the header
- /health carries it
- tests/test_dns_prefetch_control.py and lock test pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
