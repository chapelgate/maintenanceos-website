# mos-1026-apply-action-allowlist: lifecycle apply stays on erase/preserve_minimal

## Goal
_apply_decision returns early for retain, then refuses any action outside {erase, preserve_minimal} before claim_action or mutation. Unknown actions cannot wipe tenant data.

## Acceptance
- `tests/test_apply_action_allowlist.py::test_apply_actions_frozenset` passes.
- `tests/test_apply_action_allowlist.py::test_apply_rejects_unknown_action` passes.
- `tests/test_apply_action_allowlist.py::test_apply_retains_without_claim` passes.

## Safety boundary
- Licence route: NONE.
- No voice, deploy, or live personal data. commercial_release_ready stays false.
