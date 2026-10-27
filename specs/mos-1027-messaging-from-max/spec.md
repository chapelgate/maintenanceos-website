# mos-1027-messaging-from-max

## Goal
Bound Twilio From / participant on messaging inbound to PARTICIPANT_MAX with HTTP 400 before resident lookup or create_from_channel.

## Acceptance
- api.MESSAGING_FROM_MAX == channels.PARTICIPANT_MAX == 320
- messaging_inbound bounds From via _bounded_text(..., maximum=MESSAGING_FROM_MAX)
- overlong From raises HTTP 400
- tests/test_messaging_from_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
