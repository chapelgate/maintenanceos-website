# mos-1025-work-order-description-len: work-order description stays bounded

## Goal
Work-order descriptions are required, stripped, and at most 8000 characters (aligned with the voice intake truncate). Empty, non-text, and overlong descriptions fail closed with HTTP 400 before storage.

## Acceptance
- `tests/test_work_order_description_len.py::test_work_order_description_max_is_8000` passes.
- `tests/test_work_order_description_len.py::test_work_order_description_accepts_bounded_text` passes.
- `tests/test_work_order_description_len.py::test_work_order_description_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
