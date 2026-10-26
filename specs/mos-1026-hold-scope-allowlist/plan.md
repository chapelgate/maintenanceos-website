# Plan
1. Add VALID_HOLD_SCOPES = frozenset({"tenant", "record", "subject", "data_class"}).
2. Guard create_hold against the set.
3. Run the three named tests.
