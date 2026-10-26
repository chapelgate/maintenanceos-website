# mos-1026-subject-id-empty-lock: RETENTION_SWEEP subject_id stays empty

## Goal
queue_retention_sweep writes subject_id equal to RETENTION_SWEEP_SUBJECT_ID="". execute_lifecycle_sweep refuses any RETENTION_SWEEP row whose subject_id is not empty after strip. Non-empty subject ids fail closed so tenant sweeps stay unbound from a subject.

## Acceptance
- `tests/test_subject_id_empty_lock.py::test_retention_sweep_subject_id_is_empty` passes.
- `tests/test_subject_id_empty_lock.py::test_queue_retention_sweep_writes_empty_subject_id` passes.
- `tests/test_subject_id_empty_lock.py::test_execute_rejects_non_empty_subject_id` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
