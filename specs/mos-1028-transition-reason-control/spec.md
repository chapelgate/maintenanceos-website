# mos-1028-transition-reason-control

## Goal
lifecycle.transition_work_order rejects control characters in actor and reason.

## Acceptance
- transition_work_order raises ValueError on control chars before status mutate
- tests pass
