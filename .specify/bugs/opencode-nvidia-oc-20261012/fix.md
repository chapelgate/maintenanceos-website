# Fix

Add `.github/workflows/opencode.yml` verbatim from the estate NVIDIA `/oc` workflow.

- Trigger: a new issue comment or pull-request review comment from `chapelgate` that starts with `/oc` or `/opencode`.
- Runner: `ubuntu-latest` only.
- Model: the estate NVIDIA ladder, probed with one 1-token request. The job stops if none answer 200.
- Checkout uses `persist-credentials: false`. Writes go through the OpenCode GitHub App token.

Also record in `PROJECT_STATE.md` that review, docs and test slices route through `/oc` comments (NVIDIA-first).

Rollback: delete `.github/workflows/opencode.yml`.
