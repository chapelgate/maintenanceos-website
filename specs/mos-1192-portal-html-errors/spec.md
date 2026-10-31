# mos-1192-portal-html-errors
FEATURE: HTML error pages on contractor portal routes

## What
HTTPException on `/contractor/*` currently returns JSON. Browser/AT users get opaque JSON. Return a portal HTML page with role="alert" aria-live="assertive" and sanitized detail text. Non-portal routes keep JSON.

## Why
WCAG 3.3.1 / 4.1.3 — identify and announce errors on the public portal surface.

## Acceptance
- GET/POST `/contractor/*` HTTPException responses are text/html when portal path matches
- Error body includes role="alert" and aria-live="assertive"
- Detail is sanitized (no secrets)
- API JSON error behaviour unchanged for non-portal paths
- No CSP / frozen path changes; commercial_release_ready stays false
