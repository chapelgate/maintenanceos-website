# mos-1025-source-allowlist: work-order source stays on the known channel set

## Goal
`/work-orders` accepts only known channel source names. Unknown free-text sources fail closed with HTTP 400 before channel create. Length stays at most 30 characters.

## Acceptance
- `tests/test_source_allowlist.py::test_work_order_sources_known_set` passes.
- `tests/test_source_allowlist.py::test_work_order_source_accepts_allowlisted` passes.
- `tests/test_source_allowlist.py::test_work_order_source_rejects_unknown` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
