# MaintenanceOS Website Human Blockers

## HB-001 — Refresh DigitalOcean App Platform credential for component-only retirement
Status: OPEN — SINGLE BLOCKER FOR MOS-WEB-COST-001
Date: 2026-09-30

Exact blocker:
The public website is already safely decoupled from `onboarding-scan`, but the existing GitHub repository secret `DIGITALOCEAN_ACCESS_TOKEN` is not accepted by DigitalOcean for App Platform access. Guarded retirement run `36746304812` passed source/live/dependency/unit guards, then the first App Platform GET failed with `HTTP Error 401: Unauthorized`. No provider mutation occurred and `/onboarding-scan/health` remains 200.

Required human action (one of these, not both):
- replace/refresh the GitHub repository secret `DIGITALOCEAN_ACCESS_TOKEN` with a valid narrowly scoped token that can read and update App Platform app `98e3a9c0-3b3c-48eb-ac72-2b13ffbe2661`; or
- connect an equivalent authorised DigitalOcean App Platform control path.

Do not paste the token into chat. Do not delete the whole `seahorse-app`. The former browser-dependency safety blocker is already cleared: the live public bundle does not reference the paid scan endpoint and `/create` uses the queued/no-invented-data fallback.

After the credential is refreshed, rerun the existing guarded Step-5 retirement workflow against the exact deployed application SHA. It will preserve unrelated App Platform components and automatically restore the old spec if post-change verification fails.

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
