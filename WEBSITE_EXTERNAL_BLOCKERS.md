# MaintenanceOS Website External Blockers

**Owner:** MOS Website Manager
**Updated:** 2026-09-27
**Rule:** Only genuine external/manual blockers belong here. Exhaust safe authorised alternatives first.

## OPEN

### WB-002 — App Platform component-only retirement lacks mutation authority

**Scope:** Cost reduction only — retire paid `onboarding-scan` without deleting the free static website.
**Opened:** 2026-09-28

The live `/create` bundle currently references
`https://seahorse-app-4oasq.ondigitalocean.app/onboarding-scan/v1/onboarding/scan`,
so deleting the service before a static rebuild would regress website scan behaviour.

All safe independent work is complete. Component-only fail-closed tooling and evidence are in
`scripts/remove-onboarding-scan-service.py` and
`docs/COST_CUT_ONBOARDING_SCAN_2026-09-28.md`.

Remaining external requirement: an authorised DigitalOcean App Platform control path with
`app:read` + `app:update`. Do not delete the whole app.

Counsel review, manual accessibility/cross-browser QA, the static-host response-header risk decision, and owner public-launch approval are human launch gates tracked in `WEBSITE_BACKLOG.md` / `WEBSITE_LAUNCH_CHECKLIST.md`; they are not current external blockers to ordinary website engineering. Product-evidence refresh and the bounded staging red-team are complete.

## CLOSED

### WB-001 — Existing DigitalOcean static app appeared not to have deployed Step 2

**Scope:** Website Manager Step 2 — brand and discoverability live rollout
**Closed:** 2026-09-25
**Resolution:** False deployment blocker caused by stale cached verification. The existing DigitalOcean static app was already serving the Step-2 build when fetched with explicit cache bypass.

**Canonical Step-2 source commit:** `19dd1738ba9d029d8146cd23c029561483186a36`
**Existing app:** `maintenanceos-website` / `seahorse-app-4oasq`
**Live origin:** `https://seahorse-app-4oasq.ondigitalocean.app`

### Live close evidence

A cache-bypassed live verification on 2026-09-25 proved:

- homepage title: `MaintenanceOS by Chapelgate - UK maintenance operations software`
- homepage contains visible `MaintenanceOS by Chapelgate` attribution
- homepage contains `Organization`, `WebSite`, and `SoftwareApplication` structured-data types
- `/ai-receptionist/` title identifies the UK maintenance-intake page as `MaintenanceOS by Chapelgate`
- `/ai-receptionist/` contains the public brand and UK-maintenance language
- `/llms.txt` begins `# MaintenanceOS by Chapelgate`

### Cleanup

The temporary USH App-Platform experiment used while investigating WB-001 was rolled back after the cache cause was proven. USH returned `active` and its health endpoint returned `status: ok`. No new DigitalOcean app, droplet, paid service, GitHub Actions workflow, credential, or lasting USH capability was created.

**Close condition:** SATISFIED.
