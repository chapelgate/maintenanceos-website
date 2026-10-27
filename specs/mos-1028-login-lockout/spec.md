# mos-1028-login-lockout

## Goal
Dashboard sign-in fails closed after LOGIN_LOCKOUT_MAX_ATTEMPTS failed attempts for an email within LOGIN_LOCKOUT_WINDOW_SECONDS.

## Acceptance
- login_is_locked returns true after 5 failures in the window
- successful login clears failures
- dashboard refuses locked emails before password check
- tests/test_login_lockout.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags, distributed/shared lockout store.
