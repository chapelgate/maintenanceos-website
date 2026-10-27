# mos-1027-proposed-action-nonops

## Goal
Share PROPOSED_ACTION_MAX via approval_text and fail-closed wrap every non-operations Approval.proposed_action create site (decision_engine, channels, worker).

## Acceptance
- approval_text.PROPOSED_ACTION_MAX == 1000
- operations re-exports the same helper
- decision_engine, channels, and worker Approval creates call bounded_proposed_action
- tests/test_proposed_action_nonops_max.py passes

## Out of scope
identity.py, voice, deploy, commercial runtime flags, Approval.reason bounds.
