# mos-1028-approval-reason-control

## Goal
Approval and triage reasons fail closed on disallowed control characters.

## Acceptance
- shared validation permits tab/newline/carriage return
- approval and triage operations return false for disallowed controls
- focused and existing reason regressions pass
