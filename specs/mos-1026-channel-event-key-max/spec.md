# mos-1026-channel-event-key-max: ChannelEventIdentity event_key stays bounded

## Goal
create_from_channel event_key values are at most EVENT_KEY_MAX (200) characters, matching ChannelEventIdentity.event_key String(200). Overlong keys fail closed with ValueError before ChannelEventIdentity rows are written.

## Acceptance
- `tests/test_channel_event_key_max.py::test_channel_event_key_max_is_200` passes.
- `tests/test_channel_event_key_max.py::test_channel_event_key_accepts_bounded_text` passes.
- `tests/test_channel_event_key_max.py::test_channel_event_key_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
