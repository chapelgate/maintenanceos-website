# mos-1028-dashboard-login-maxchars

## Goal
Expose EMAIL_LOOKUP_MAX and LOGIN_PASSWORD_MAX on dashboard login inputs via Streamlit max_chars so the UI matches server fail-closed bounds.

## Acceptance
- Email input has max_chars=EMAIL_LOOKUP_MAX
- Password input has max_chars=LOGIN_PASSWORD_MAX
- Existing login length checks still present
- tests/test_dashboard_login_maxchars.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
