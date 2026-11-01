# mos-1224-triage-control-chars
FEATURE: reject control characters in resolve_triage category/trade/urgency

## What
resolve_triage rejects control chars on reason but not on category/trade/urgency fields.

## Acceptance
- resolve_triage returns False on control chars in category/trade/urgency
- Clean triage still resolves correctly
- Named acceptance test green
