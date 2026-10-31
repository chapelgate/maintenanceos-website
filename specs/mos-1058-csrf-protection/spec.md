# mos-1058-csrf-protection

## Problem
Contractor HTML forms accept state-changing POSTs with only the signed link token. A CSRF field bound to APP_SECRET was missing, and /health did not advertise an x-csrf-token.

## Acceptance
- Health responses include x-csrf-token
- Decision/availability/complete GET forms embed csrf_token
- POSTs reject missing/invalid CSRF; accept valid CSRF
- Quotes/internal paths stay bearer-gated (not form-CSRF gated)

## Scope
security.py helpers; api.py contractor forms + health header; tests. No voice/deploy edits.
