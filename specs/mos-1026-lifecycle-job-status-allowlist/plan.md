# Plan
1. Add VALID_LIFECYCLE_JOB_STATUSES = frozenset({"PENDING", "RUNNING", "COMPLETED", "FAILED"}).
2. Guard queue write against the set and set status=PENDING explicitly.
3. Run the three named tests.
