# mos-1028-availability-datetime-control

## Goal
Contractor availability start/end parameters reject control characters.

## Acceptance
- availability_submit calls _reject_control_chars on start and end
- tests pass