# Plan
1. Add VALID_LIFECYCLE_JOB_TYPES = frozenset({"DATA_LIFECYCLE_SWEEP"}).
2. Guard execute_lifecycle_sweep against the set before payload parse.
3. Run the three named tests.
