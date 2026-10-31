# Spec: Form Stub Abuse Controls

## Objective
Add bounded public rate limiting and Content-Type enforcement to the local form stub so it matches docs/FORM_ENDPOINT_CONTRACT.md abuse controls.

## Acceptance Criteria
- POST /leads returns 429 with Retry-After after RATE_LIMIT_MAX_PER_WINDOW requests in RATE_LIMIT_WINDOW_MS for the same Origin+path
- POST /leads returns 415 when Content-Type is not application/json
- Existing CORS, honeypot, redaction, and queued_stub behaviour unchanged
- Never sends email; publicLaunch untouched; no frozen paths
- scripts/form-stub-server.test.mjs covers rate limit + Content-Type cases
