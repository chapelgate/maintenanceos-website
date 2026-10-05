# Test

VERIFIED.

Evidence:
- repository runner inventory shows `chapelgate-pool-mos` online with labels: self-hosted, Linux, X64, chapelgate, estate-trusted.
- `python scripts/gha-runner-policy-check.py .` returns PASS after the fix.
- obsolete Windows probe has no repository references outside its own deleted workflow.
- Estate Gate must pass on the exact PR head before merge.

Estate metadata was corrected before final verification.
