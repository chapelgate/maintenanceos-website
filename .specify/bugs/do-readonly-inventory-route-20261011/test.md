# Test

- Static: the workflow contains no POST/PUT/PATCH/DELETE, no `actions/checkout`, no third-party `uses:`, and only the `workflow_dispatch` trigger.
- Live: after merge, `gh workflow run do-readonly-inventory.yml -R chapelgate/maintenanceos-website` completes with `RESULT=ok` and prints the droplet list. The run ID is recorded in the PR comments and in Eggbot's estate cleanup evidence.

Verdict: static checks verified before the PR was opened; the live check is verified after merge.
