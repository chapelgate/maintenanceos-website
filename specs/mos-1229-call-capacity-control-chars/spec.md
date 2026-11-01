# mos-1229-call-capacity-control-chars
FEATURE: reject control characters in call_capacity lease call_sid/worker_id

## What
try_acquire accepts call_sid/worker_id strings without control-char validation.

## Acceptance
- try_acquire returns False when call_sid contains control chars
- try_acquire returns False when worker_id contains control chars
- clean leases acquire normally
- Named acceptance test green
