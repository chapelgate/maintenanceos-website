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

## HB-002 — Physical Safari/iOS and manual assistive-technology launch QA
Status: OPEN LAUNCH-ONLY HUMAN GATE
Date: 2026-09-30

Exact blocker:
Automated engineering coverage now includes Edge, Firefox and WebKit at mobile,
tablet and desktop widths, but it cannot certify physical Safari/iOS behaviour or
manual assistive-technology usability.

Required human action:
- run the six buyer-critical routes on physical Safari/macOS and iOS Safari;
- complete a manual keyboard pass and an assistive-technology pass;
- record browser/device/OS versions plus any defects found;
- return defects for engineering repair and re-verification before public launch.

This does not block ordinary pre-launch engineering or the current staging site.
Evidence: `docs/CROSS_ENGINE_BROWSER_QA_2026-09-30.md`.
