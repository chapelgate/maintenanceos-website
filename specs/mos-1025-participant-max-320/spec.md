# mos-1025-participant-max-320: channel participants stay at most 320 characters

## Goal
create_from_channel participants are at most 320 characters, matching Communication.participant String(320). Overlong values fail closed with ValueError before SessionLocal work begins.

## Acceptance
- `tests/test_participant_max_320.py::test_participant_max_is_320` passes.
- `tests/test_participant_max_320.py::test_participant_accepts_bounded_text` passes.
- `tests/test_participant_max_320.py::test_participant_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
