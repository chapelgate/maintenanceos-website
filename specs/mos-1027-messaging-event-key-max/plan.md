# Plan
1. Add messaging_event_key helper and MESSAGING_EVENT_KEY_MAX.
2. Wire messaging_inbound to use it; map create_from_channel ValueError to HTTP 400.
3. Add focused tests.
