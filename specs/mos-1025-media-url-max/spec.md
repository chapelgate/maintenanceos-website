# mos-1025-media-url-max: channel media URLs stay at most 2000 characters

## Goal
create_from_channel media_url values are stripped and at most 2000 characters. Overlong values fail closed with ValueError before SessionLocal work begins. Blank media URLs remain allowed.

## Acceptance
- `tests/test_media_url_max.py::test_media_url_max_is_2000` passes.
- `tests/test_media_url_max.py::test_media_url_accepts_bounded_text` passes.
- `tests/test_media_url_max.py::test_media_url_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
