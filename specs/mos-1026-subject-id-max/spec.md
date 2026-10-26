# mos-1026-subject-id-max: retention sweep subject_id stays at most 200 characters

## Goal
queue_retention_sweep accepts an optional subject_id (default empty), strips it, and keeps it at most SUBJECT_ID_MAX (200) characters matching DataLifecycleRequest.subject_id String(200). Overlong subject ids fail closed with LifecycleRuntimeError before the request row is written.

## Acceptance
- `tests/test_subject_id_max.py::test_subject_id_max_is_200` passes.
- `tests/test_subject_id_max.py::test_subject_id_accepts_bounded_text` passes.
- `tests/test_subject_id_max.py::test_subject_id_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
