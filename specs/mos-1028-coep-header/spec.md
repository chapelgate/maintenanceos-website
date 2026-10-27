# mos-1028-coep-header

## Goal
Lock Cross-Origin-Embedder-Policy require-corp on every HTTP response so cross-origin embeds without CORP fail closed.

## Acceptance
- SECURITY_HEADERS includes cross-origin-embedder-policy require-corp
- /health carries the header
- tests/test_coep_header.py and test_security_headers_lock.py pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
