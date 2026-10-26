# mos-1025-source-max-30: work-order source stays at most 30 characters

## Goal
Work-order source strings on `/work-orders` are required, stripped, and at most 30 characters, matching `WorkOrder.source` String(30). Empty, non-text, and overlong sources fail closed with HTTP 400 before channel create.

## Acceptance
- `tests/test_source_max_30.py::test_work_order_source_max_is_30` passes.
- `tests/test_source_max_30.py::test_work_order_source_accepts_bounded_text` passes.
- `tests/test_source_max_30.py::test_work_order_source_rejects_empty_and_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
