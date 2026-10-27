# mos-1028-portal-datetime-type

## Goal
Contractor availability start/end inputs use type="datetime-local" so the browser validates the date/time before submission.

## Acceptance
- /contractor/availability form declares start/end with type="datetime-local"
- strptime parses %Y-%m-%dT%H:%M
- tests/test_portal_availability_datetime_type.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
