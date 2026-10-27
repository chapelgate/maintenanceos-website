# mos-1027-lifecycle-transition-audit

## Goal
Fail closed and redact when lifecycle.transition_work_order writes WORK_ORDER_STATUS_CHANGED audit rows, matching operations.audit bounds.

## Acceptance
- lifecycle.TRANSITION_REASON_MAX == 1000 and TRANSITION_ACTOR_MAX == 100
- Overlong actor/reason raise ValueError before status mutate
- Audit detail runs through audit_text.redact_detail
- tests/test_lifecycle_transition_audit.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
