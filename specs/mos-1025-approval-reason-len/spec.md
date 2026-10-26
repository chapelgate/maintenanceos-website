# mos-1025-approval-reason-len: Approval reason stays bounded

## Goal
Operational approval reasons are stripped and at most 1000 characters. Overlong reasons fail closed before SessionLocal. Existing type-gated minimum of 5 characters for REASON_REQUIRED_APPROVALS is unchanged.

## Acceptance
- `tests/test_approval_reason_len.py::test_approval_reason_max_is_1000` passes.
- `tests/test_approval_reason_len.py::test_approval_reason_accepts_bounded_reason` passes.
- `tests/test_approval_reason_len.py::test_approval_reason_rejects_overlong` passes.

## Safety boundary
- No voice, deploy, or live personal data. commercial_release_ready stays false.
