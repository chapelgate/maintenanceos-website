# mos-1206-login-lockout-event
FEATURE: emit operational_event when dashboard login lockout engages

## What
record_login_failure locks after LOGIN_LOCKOUT_MAX_ATTEMPTS but emits no operational event.

## Acceptance
- On the failure that first reaches the lockout threshold, emit operational_event("login_lockout", ...)
- Fields: outcome/reason_code only (never email or key)
- Existing login lockout suites stay green
