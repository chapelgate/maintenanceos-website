# Plan
1. Add VALID_LIFECYCLE_JOB_PAYLOAD_KEYS = frozenset({"client_id", "request_id"}).
2. Guard queue write and execute parse against exact key set.
3. Run the three named tests.
