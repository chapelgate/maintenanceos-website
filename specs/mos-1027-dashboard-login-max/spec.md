# mos-1027-dashboard-login-max

## Goal
Bound dashboard sign-in email to EMAIL_LOOKUP_MAX (320) and password to LOGIN_PASSWORD_MAX (200) before DB lookup or PBKDF2 verify, with explicit Streamlit errors.

## Acceptance
- auth() refuses overlong email/password before SessionLocal query
- security.verify_password returns False for overlong passwords
- security.hash_password raises ValueError for overlong passwords
- tests/test_dashboard_login_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags, identity provider wiring.
