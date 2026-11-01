# Plan: Form Stub Abuse Controls

## Tasks
- [x] Add RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX_PER_WINDOW + rateLimit()
- [x] Enforce Content-Type application/json with 415
- [x] Return 429 + Retry-After when bucket exhausted
- [x] Tests: unit rateLimit, POST 415, POST 429, beforeEach clears map
- [x] Update FORM_ENDPOINT_CONTRACT status table for 415 / stub rate note
