# Plan
1. Fail closed after action_key/event_key length checks using reason_has_control_chars.
2. Cover accept, decline, availability, completion, confirm_appointment.
3. Test SessionLocal is not opened for control-char keys.
