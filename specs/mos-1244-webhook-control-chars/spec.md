# mos-1244-webhook-control-chars
FEATURE: reject control characters in webhook_security Twilio URL/signature inputs

## What
validate_twilio/validate_twilio_websocket accept URL/signature strings without control-char validation.

## Acceptance
- validate_twilio returns False when url or signature contains control chars
- validate_twilio_websocket returns False when url or signature contains control chars
- clean inputs behave normally
