# mos-1027-escalation-reason-max

## Goal
Fail closed when Escalation.reason exceeds 2000 characters before persistence on decision_engine and worker create sites.

## Acceptance
- escalation_text.ESCALATION_REASON_MAX == 2000
- decision_engine and worker Escalation creates call bounded_escalation_reason
- tests/test_escalation_reason_max.py passes

## Out of scope
identity.py, voice, deploy, resolve_escalation resolution text (already capped), commercial runtime flags.
