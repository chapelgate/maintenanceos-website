# mos-1026-execute-payload-object: execute refuses non-object lifecycle job payloads

## Goal
`execute_lifecycle_sweep` refuses any job whose JSON payload is not a JSON object before tenant lookup or mutation.

## Acceptance
- `tests/test_execute_payload_object.py::test_execute_requires_payload_object` passes.
- `tests/test_execute_payload_object.py::test_execute_rejects_payload_list` passes.
- `tests/test_execute_payload_object.py::test_execute_rejects_payload_string` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
