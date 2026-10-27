# mos-1028-x-download-options

## Goal
Emit X-Download-Options: noopen on HTTP responses via SECURITY_HEADERS.

## Acceptance
- SECURITY_HEADERS includes x-download-options=noopen
- /health carries the header
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
