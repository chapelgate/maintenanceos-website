# mos-1028-dashboard-login-autocomplete

## Goal
Dashboard login Email/Password inputs declare autocomplete="username" and autocomplete="current-password" for WCAG-aligned credential fields.

## Acceptance
- Email input has autocomplete="username"
- Password input has autocomplete="current-password"
- existing max_chars bounds remain
- tests/test_dashboard_login_autocomplete.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
