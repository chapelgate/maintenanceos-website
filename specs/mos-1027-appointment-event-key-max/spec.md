# mos-1027-appointment-event-key-max: appointment confirmation event key length lock

## Goal
Fail closed when confirm_appointment receives an event_key longer than ACTION_KEY_MAX (200), matching ActionReceipt.action_key String(200), before opening a session.

## Acceptance
- tests/test_appointment_event_key_max.py passes (uses ACTION_KEY_MAX, accepts bound, rejects overlong without session).

## Safety
Licence route: NONE. No voice, deploy, secrets, or live personal data.
