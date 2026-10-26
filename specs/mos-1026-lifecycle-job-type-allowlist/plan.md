# Plan
1. Add VALID_LIFECYCLE_JOB_TYPES = frozenset({"DATA_LIFECYCLE_SWEEP"}).
2. Guard queue write against the set before AutomationJob insert.
3. Run the three named tests.
