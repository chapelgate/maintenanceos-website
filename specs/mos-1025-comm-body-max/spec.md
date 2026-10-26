# mos-1025-comm-body-max: outbound communication body stays bounded

## Goal
queue_outbound body values are at most COMMUNICATION_BODY_MAX (10000) characters. Overlong bodies fail closed with ValueError("Invalid outbound communication") before Communication rows are written. The named constant replaces the prior magic number.

## Acceptance
- `tests/test_comm_body_max.py::test_communication_body_max_is_10000` passes.
- `tests/test_comm_body_max.py::test_communication_body_accepts_bounded_text` passes.
- `tests/test_comm_body_max.py::test_communication_body_rejects_overlong` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
