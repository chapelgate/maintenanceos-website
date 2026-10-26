# mos-1025-messaging-body-len: inbound messaging body stays bounded

## Goal
Inbound SMS/WhatsApp bodies on /messaging/inbound are stripped and at most 4000 characters. Overlong bodies fail closed with HTTP 400 before work-order or unmatched-inbound storage.

## Acceptance
- `tests/test_messaging_body_len.py::test_messaging_body_max_is_4000` passes.
- `tests/test_messaging_body_len.py::test_messaging_body_accepts_bounded_text` passes.
- `tests/test_messaging_body_len.py::test_messaging_body_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
