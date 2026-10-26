# mos-1026-execute-request-wrong-type

## Goal
execute_lifecycle_sweep raises lifecycle_request_wrong_type when the request exists for the tenant but request_type is not RETENTION_SWEEP.

## Acceptance
- tests/test_execute_request_wrong_type.py — 3 passed.

## Safety
Licence route: NONE. No voice, deploy, secrets, or live personal data.
