# mos-1028-safety-clearance-control

## Goal
clear_critical_safety rejects control characters in clearance reason (covers dashboard path).

## Acceptance
- clear_critical_safety raises SafetyStateError on control chars
- tests pass
