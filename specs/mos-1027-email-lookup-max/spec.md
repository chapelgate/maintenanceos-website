# mos-1027-email-lookup-max

## Goal
Fail closed when `channels.resident_by_email` receives a blank or overlong email before `SessionLocal` opens.

## Acceptance
- `EMAIL_LOOKUP_MAX` is 320 (matches `Resident.email` String(320))
- blank / whitespace / overlong email returns None without opening a session
- bounded email still proceeds to open a session

## Out of scope
Voice, deploy, identity.py, live personal data, commercial runtime flags.
