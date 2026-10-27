# mos-1027-messaging-event-key-max

## Goal
Bound messaging inbound event keys to EVENT_KEY_MAX at the API boundary: reject overlong MessageSid with HTTP 400, and when MessageSid is absent use a short hashed fallback instead of embedding the message body.

## Acceptance
- api.MESSAGING_EVENT_KEY_MAX == channels.EVENT_KEY_MAX == 200
- messaging_event_key rejects overlong MessageSid with HTTP 400
- messaging_event_key returns MessageSid when present and bounded
- messaging_event_key returns msg:<40-hex> when MessageSid is blank; length <= MESSAGING_EVENT_KEY_MAX
- messaging_inbound uses messaging_event_key before create_from_channel
- tests/test_messaging_event_key_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
