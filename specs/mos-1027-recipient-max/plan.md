# Plan
1. Add RECIPIENT_MAX = 320 to communications.py.
2. Include len(recipient)>RECIPIENT_MAX in queue_outbound fail-closed guard.
3. Add tests/test_recipient_max.py.
