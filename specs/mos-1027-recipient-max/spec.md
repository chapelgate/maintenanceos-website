# mos-1027-recipient-max: outbound recipient length lock

## Goal
Fail closed when queue_outbound receives a recipient longer than 320 characters (matches Communication.participant String(320) / channel participant max).

## Acceptance
- tests/test_recipient_max.py passes (constant, accepts bound, rejects overlong).
- RECIPIENT_MAX used in queue_outbound validation.

## Safety
Licence route: NONE. No voice, deploy, secrets, or live personal data.
