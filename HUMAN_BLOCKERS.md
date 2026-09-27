# MaintenanceOS Website Human Blockers

## HB-001 — App Platform mutation authority for component-only retirement
Status: OPEN
Date: 2026-09-28

Exact blocker:
No currently connected tool can GET/PUT the DigitalOcean App Platform spec for app
`98e3a9c0-3b3c-48eb-ac72-2b13ffbe2661`.

Required human action (one of these, not both):
- provide/connect an App Platform-capable DigitalOcean control path to ChatGPT; or
- create a narrowly scoped DigitalOcean API token with `app:read` and `app:update` and make it available to the authorised execution environment without pasting it into chat.

Do not delete the whole `seahorse-app`.
Do not delete `onboarding-scan` before the static `/create` bundle no longer references it.

Once authority exists, run the guarded cutover documented in
`docs/COST_CUT_ONBOARDING_SCAN_2026-09-28.md`.
