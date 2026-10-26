# Plan
1. Add WORK_ORDER_SOURCES frozenset of known channel names to api.py.
2. Bound source to 30 characters and reject values outside WORK_ORDER_SOURCES before create_from_channel.
3. Run the three named tests.
