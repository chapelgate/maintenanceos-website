# mos-1246-call-notifications-control-chars
FEATURE: reject control characters in call_notifications extract_call_details transcript input

## What
extract_call_details accepts raw transcript without control-char validation.

## Acceptance
- extract_call_details returns empty result on control chars in transcript
- clean transcripts still extract fields
