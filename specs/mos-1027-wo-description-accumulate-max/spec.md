# mos-1027-wo-description-accumulate-max

## Goal
Fail closed when appending a channel follow-up would grow WorkOrder.description past CHANNEL_DESCRIPTION_MAX (8000).

## Acceptance
- channels.create_from_channel raises ValueError when combined description would exceed CHANNEL_DESCRIPTION_MAX
- Communication is not committed when accumulate would overflow
- Single inbound descriptions at the cap still accepted on create

## Out of scope
identity.py, voice, deploy, schema migrations, commercial runtime flags.
