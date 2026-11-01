# mos-1247-channels-control-chars
FEATURE: reject control characters in channels create_from_channel / canonical_incident_key inputs

## What
create_from_channel and canonical_incident_key accept raw description/participant/media_url/event_key without control-char validation.

## Acceptance
- Both functions return/reject on control chars in string inputs
- clean inputs still process
