# MaintenanceOS Website External Blockers

**Owner:** MOS Website Manager
**Updated:** 2026-09-30
**Rule:** Only genuine external/manual blockers belong here. Exhaust safe authorised alternatives first.

## OPEN

No external blocker currently prevents ordinary website engineering.

Counsel review, physical Safari/iOS and manual assistive-technology QA, the
static-host response-header risk decision, and owner public-launch approval remain
human launch gates tracked in `WEBSITE_BACKLOG.md`, `HUMAN_BLOCKERS.md` and
`WEBSITE_LAUNCH_CHECKLIST.md`.

## CLOSED

### WB-002 — App Platform component-only onboarding-scan retirement

**Scope:** Cost reduction only — retire paid `onboarding-scan` without deleting the static website.
**Opened:** 2026-09-28
**Closed:** 2026-09-30
**Resolution:** The public `/create` client was first made source-level fail-closed
to the zero-scan queued fallback. The paid DigitalOcean App Platform
`onboarding-scan` service and its ingress rule were then removed through a
target-scoped, rollback-protected workflow using an existing authorised estate
credential.

Close evidence:
- public bundle no longer referenced the retired endpoint before provider mutation;
- DigitalOcean preflight found exactly one target service and one target ingress rule;
- post-update App Platform spec retained static site `maintenanceos-website` and
  reported no remaining service;
- live `/` and `/create/` remained HTTP 200;
- live `/onboarding-scan/health` transitioned from 200 to 404;
- independent read-only App Platform verification returned `SERVICES=`;
- final website `main` and live release converged on
  `2601ed0b57efe6af8aaf0f4ef491775b2762d46e`;
- no replacement server, droplet or paid infrastructure was created.

Evidence: `MASTER_PROBLEM_LOG.md` and
`docs/COST_CUT_ONBOARDING_SCAN_2026-09-28.md`.

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
