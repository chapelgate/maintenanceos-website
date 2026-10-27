# mos-1027-proposed-action-max

## Goal
Fail closed when Approval.proposed_action exceeds 1000 characters before persistence on operations paths.

## Acceptance
- operations.PROPOSED_ACTION_MAX == 1000
- bounded_proposed_action rejects blank and overlong values
- DISPATCH/QUOTE/INVOICE/REPEAT_REPAIR/EVIDENCE_REUSE approval creates use bounded_proposed_action

## Out of scope
identity.py, voice, deploy, schema migrations, commercial runtime flags.
