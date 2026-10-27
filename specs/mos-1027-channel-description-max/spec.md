# mos-1027-channel-description-max

## Goal
Fail closed when `channels.create_from_channel` receives a blank or overlong description before `SessionLocal` opens.

## Acceptance
- `CHANNEL_DESCRIPTION_MAX` equals `api.WORK_ORDER_DESCRIPTION_MAX` (8000)
- blank / whitespace / overlong description raises `ValueError("description is invalid")` without opening a session
- bounded description still proceeds to open a session

## Out of scope
Voice, deploy, identity.py, live personal data, commercial runtime flags.
