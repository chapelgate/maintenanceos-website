# Test

- The committed workflow file matches the estate source byte for byte (`cmp` against the supplied `opencode.yml`).
- The trigger is limited to `chapelgate` and a body that starts with `/oc` or `/opencode`.
- `runs-on` is `ubuntu-latest`. There is no self-hosted or estate runner.
- This pull request does not dispatch the workflow.

Verdict: verified before the pull request was opened. A live `/oc` comment is a later owner action, not part of this merge.
