# mos-1026-channel-source-max: channel source stays at most 30 characters

## Goal
create_from_channel source values are stripped and at most CHANNEL_SOURCE_MAX (30) characters, matching ChannelEventIdentity.source and WorkOrder.source String(30). Overlong sources fail closed with ValueError before IncidentIdentity or ChannelEventIdentity rows are written.

## Acceptance
- `tests/test_channel_source_max.py::test_channel_source_max_is_30` passes.
- `tests/test_channel_source_max.py::test_channel_source_accepts_bounded_text` passes.
- `tests/test_channel_source_max.py::test_channel_source_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
