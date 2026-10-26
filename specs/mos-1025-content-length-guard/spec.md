# mos-1025-content-length-guard: Content-Length failures stay fail-closed

## Goal
Lock Content-Length parsing so invalid or conflicting values return 400, and a declared length above `MAX_REQUEST_BYTES` returns 413 before the application handler runs.

## Acceptance
- `tests/test_content_length_guard.py::test_invalid_and_conflicting_content_length` passes.
- `tests/test_content_length_guard.py::test_declared_oversize_returns_413` passes.
- `tests/test_content_length_guard.py::test_max_request_bytes_is_64kib` passes.

## Safety boundary
- Licence route: NONE.
- No frozen paths, no voice edit, no deploy edit.
