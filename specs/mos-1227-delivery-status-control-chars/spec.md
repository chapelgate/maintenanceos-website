# mos-1227-delivery-status-control-chars
FEATURE: reject control characters in record_delivery_status provider_reference/failure_code

## What
record_delivery_status validates length but allows control characters in provider_reference and failure_code.

## Acceptance
- Return False on control chars in provider_reference/failure_code
- Existing length/transition rejects stay
- Named acceptance test green
