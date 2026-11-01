# mos-1220-sla-known-urgency
FEATURE: expose known_urgency helper for SLA TARGETS membership

## What
Callers cannot tell whether an urgency code is a recognised SLA key; sla_status silently defaults unknowns.

## Acceptance
- known_urgency returns True only for TARGETS keys (P1-P4)
- Returns False for empty/unknown values
- sla_status behaviour unchanged for existing callers
