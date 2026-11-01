# mos-1253-call-notifications-empty-keys
FEATURE: control-char early return from extract_call_details uses canonical field names

## What
extract_call_details returns empty gate/fault keys on control chars, but callers and tests expect gate_number/fault_or_request.

## Acceptance
- control-char transcript returns gate_number and fault_or_request as empty strings
- clean transcript still extracts gate_number
