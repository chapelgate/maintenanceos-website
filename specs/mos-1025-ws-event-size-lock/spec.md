# mos-1025-ws-event-size-lock: websocket events stay inside 256 KiB

## Goal
Lock the local websocket event cap at 256 KiB of UTF-8 bytes, reject non-text frames, and prove the voice ingress modules call that check. This does not change the golden line.

## Acceptance
- `tests/test_ws_event_size_lock.py::test_websocket_event_cap_is_256_kib` passes.
- `tests/test_ws_event_size_lock.py::test_websocket_event_limit_counts_utf8_bytes` passes.
- `tests/test_ws_event_size_lock.py::test_voice_ingress_calls_event_limit` passes.

## Safety boundary
- Licence route: NONE.
- No edits to voice handlers, deploy configs, or the golden phone line.
