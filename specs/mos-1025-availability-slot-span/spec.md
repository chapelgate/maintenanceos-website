# mos-1025-availability-slot-span: availability slot span stays bounded

## Goal
Contractor availability slots must have end after start and a span of at most 14 days. Equal, inverted, and overlong spans fail closed with HTTP 400 before storage.

## Acceptance
- `tests/test_availability_slot_span.py::test_availability_slot_max_days_is_14` passes.
- `tests/test_availability_slot_span.py::test_availability_slot_accepts_bounded_span` passes.
- `tests/test_availability_slot_span.py::test_availability_slot_rejects_inverted_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
