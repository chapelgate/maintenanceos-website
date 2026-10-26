# mos-1025-triage-reason-len: Triage resolution reason stays bounded

## Goal
Triage resolution reasons are stripped, at least 5 characters, and at most 1000 characters. Empty, short, and overlong reasons fail closed before the triage is resolved.

## Acceptance
- `tests/test_triage_reason_len.py::test_triage_resolution_max_is_1000` passes.
- `tests/test_triage_reason_len.py::test_triage_resolution_accepts_bounded_reason` passes.
- `tests/test_triage_reason_len.py::test_triage_resolution_rejects_short_and_overlong` passes.

## Safety boundary
- No voice, deploy, or live personal data. commercial_release_ready stays false.
