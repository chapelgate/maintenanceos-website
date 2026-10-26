# Plan

1. Add `tests/test_n2_deploy_clean_tree.py` that records rollback file bytes, runs the Twilio refusal path, and asserts byte identity afterward.
2. In `apply_deploy`, move the `TWILIO_AUTH_TOKEN` presence check before `write_rollback`; keep the existing error text.
3. Confirm the existing refusal test still passes and porcelain is clean for the rollback file.
4. Do not open the call window, call Render, or edit voice modules.

Rollback: revert the three touched product files (`scripts/controlled_n2_deploy.py`, `tests/test_n2_deploy_clean_tree.py`, and this specs dir).
