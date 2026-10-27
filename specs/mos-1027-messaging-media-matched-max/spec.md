# mos-1027-messaging-media-matched-max

## Goal
Bound MediaUrl0 on the matched messaging inbound path to MEDIA_URL_MAX with HTTP 400 before create_from_channel.

## Acceptance
- api.MESSAGING_MEDIA_URL_MAX == channels.MEDIA_URL_MAX == 2000
- messaging_inbound uses _bounded_text(..., maximum=MESSAGING_MEDIA_URL_MAX) for MediaUrl0
- overlong MediaUrl0 raises HTTP 400
- tests/test_messaging_media_matched_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
