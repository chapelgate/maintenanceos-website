# Plan
1. Add VALID_REQUEST_TYPES = frozenset({"RETENTION_SWEEP"}).
2. Guard queue write and execute lookup against the set.
3. Run the three named tests.
