# mos-1025-unmatched-media-url-max: unmatched inbound media URL stays bounded

## Goal
Media URLs stored on UnmatchedInbound from /messaging/inbound are stripped and at most 2000 characters. Overlong values fail closed with HTTP 400 before unmatched storage. Blank media URLs remain allowed.

## Acceptance
- `tests/test_unmatched_media_url_max.py::test_unmatched_inbound_media_url_max_is_2000` passes.
- `tests/test_unmatched_media_url_max.py::test_unmatched_inbound_media_url_accepts_bounded_text` passes.
- `tests/test_unmatched_media_url_max.py::test_unmatched_inbound_media_url_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
