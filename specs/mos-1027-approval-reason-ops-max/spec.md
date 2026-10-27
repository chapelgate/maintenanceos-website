# mos-1027-approval-reason-ops-max

## Goal
Fail closed when Approval.reason exceeds 1000 characters on operations, channels, and worker create sites, reusing approval_text.bounded_approval_reason.

## Acceptance
- operations re-exports APPROVAL_REASON_MAX from approval_text
- operations, channels, and worker Approval creates call bounded_approval_reason
- tests/test_approval_reason_ops_max.py passes

## Out of scope
identity.py, voice, deploy, approve_operational_action blank-allowed decide path, commercial runtime flags.
