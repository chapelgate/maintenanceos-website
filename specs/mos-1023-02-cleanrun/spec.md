# mos-1023-02-cleanrun: Stop suite dirtying n2 rollback evidence

## Goal
A green pytest run must leave `docs/concurrency_100_evidence/n2-rollback-point.json` unchanged. `apply_deploy` must check `TWILIO_AUTH_TOKEN` presence and raise `RenderInventoryError` before calling `write_rollback`.

## Acceptance
- `tests/test_ush_identity_lifecycle.py::test_controlled_n2_deploy_refuses_open_window_without_twilio_auth` exits 0 with the same error text contract.
- `tests/test_n2_deploy_clean_tree.py::test_refusal_leaves_rollback_file_unchanged` exits 0.
- After the refusal path, `git status --porcelain docs/concurrency_100_evidence/n2-rollback-point.json` prints nothing.
- No call window opened; no Render API call; voice modules untouched.

## Safety boundary
- Licence route: NONE. Edit in-repo script and tests only.
- Do not commit a new baseline for the rollback evidence file.
- Frozen paths untouched.
