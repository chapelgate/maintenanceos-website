# mos-1025-safety-clearance-reason-len: safety-clearance reason stays bounded

## Goal
Safety-clearance reasons are required, stripped, at least 10 characters, and at most 1000 characters. Empty, short, and overlong reasons fail closed before the critical-safety latch is cleared.

## Acceptance
- `tests/test_safety_clearance_reason_len.py::test_safety_clearance_reason_max_is_1000` passes.
- `tests/test_safety_clearance_reason_len.py::test_safety_clearance_reason_accepts_bounded_text` passes.
- `tests/test_safety_clearance_reason_len.py::test_safety_clearance_reason_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
