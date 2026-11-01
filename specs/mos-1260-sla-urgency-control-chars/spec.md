# mos-1260-sla-urgency-control-chars
FEATURE: reject control characters in sla_status urgency

## What
sla_status treated any string as urgency key; C0 controls could bypass known_urgency intent.

## Acceptance
- sla_status raises ValueError on control-char urgency
- known P1-P4 path unchanged
- unknown non-control urgency still defaults to 1440
