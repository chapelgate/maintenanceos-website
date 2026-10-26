# mos-1025-escalation-reason-len: escalation resolution reason stays bounded

## Goal
Escalation resolution reasons are stripped, at least 5 characters, and at most 1000 characters. Empty, short, and overlong reasons fail closed before the escalation is marked RESOLVED.

## Acceptance
- `tests/test_escalation_reason_len.py::test_escalation_resolution_max_is_1000` passes.
- `tests/test_escalation_reason_len.py::test_escalation_resolution_accepts_bounded_reason` passes.
- `tests/test_escalation_reason_len.py::test_escalation_resolution_rejects_short_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
