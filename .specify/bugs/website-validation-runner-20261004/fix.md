# Fix

Use configuration only:

1. Run the existing validation job on `ubuntu-latest` because the repository has no claimable self-hosted runner.
2. Keep the existing Docker-isolated validator unchanged except pass `SOURCE_COMMIT_HASH` into the container.
3. Resolve that value to the pull-request head SHA, falling back to `github.sha` for the legacy push trigger.
4. Keep the release-marker fail-closed logic unchanged.
5. Include this workflow path in the existing PR path filter so workflow repairs self-validate.

Rollback: revert this PR. No production runtime or deployment is changed.
