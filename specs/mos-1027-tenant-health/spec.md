# mos-1027-tenant-health

## Goal
Expose an allowlisted, process-local tenant-health shape on GET /health without claiming central monitoring or querying live tenant data.

## Acceptance
`tests/test_health_allowlist.py` passes and proves exact nested keys, safe types, and process-local scope.

## Safety
No production data, deploy, voice, identity, or frozen path changes.
