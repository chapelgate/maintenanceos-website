# Plan
1. Extend SECURITY_HEADERS with permissions-policy and cross-origin-opener-policy.
2. Add dedicated lock tests for the exact header tuple and /health responses.
3. Do not change rate limits or body-size bounds.
Rollback: revert ingress_security.py header tuple; delete tests and specs dir.
