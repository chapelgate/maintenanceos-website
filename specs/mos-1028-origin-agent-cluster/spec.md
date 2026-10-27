# mos-1028-origin-agent-cluster

## Goal
Emit Origin-Agent-Cluster: ?1 on HTTP responses via SECURITY_HEADERS.

## Acceptance
- SECURITY_HEADERS includes origin-agent-cluster=?1
- /health carries the header
- commercial_release_ready stays false

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
