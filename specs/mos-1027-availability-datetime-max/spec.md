# mos-1027-availability-datetime-max

## Goal
Bound contractor availability start/end form text before datetime parse so overlong strings fail closed with HTTP 400.

## Acceptance
- AVAILABILITY_DATETIME_TEXT_MAX = 32 in api.py
- availability_submit rejects start/end longer than 32 before strptime
- Valid "YYYY-MM-DD HH:MM" (16 chars) still parses
- tests/test_availability_datetime_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
