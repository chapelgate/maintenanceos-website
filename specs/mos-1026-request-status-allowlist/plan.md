# Plan
1. Add VALID_REQUEST_STATUSES = frozenset({"PENDING", "COMPLETED"}).
2. Guard queue write; refuse execute when status is not PENDING.
3. Run the three named tests.
