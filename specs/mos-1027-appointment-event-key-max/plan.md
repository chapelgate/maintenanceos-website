# Plan
1. Import ACTION_KEY_MAX in operations.py.
2. Return False when confirm_appointment event_key exceeds ACTION_KEY_MAX before SessionLocal.
3. Add tests/test_appointment_event_key_max.py.
