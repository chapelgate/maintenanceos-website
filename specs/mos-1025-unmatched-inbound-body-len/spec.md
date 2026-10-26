# mos-1025-unmatched-inbound-body-len: unmatched inbound body stays bounded

## Goal
Bodies stored on UnmatchedInbound from /messaging/inbound are stripped and at most 4000 characters. Overlong bodies fail closed with HTTP 400 before unmatched storage.

## Acceptance
- `tests/test_unmatched_inbound_body_len.py::test_unmatched_inbound_body_max_is_4000` passes.
- `tests/test_unmatched_inbound_body_len.py::test_unmatched_inbound_body_accepts_bounded_text` passes.
- `tests/test_unmatched_inbound_body_len.py::test_unmatched_inbound_body_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
