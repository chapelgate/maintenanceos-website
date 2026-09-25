# MaintenanceOS Website External Blockers

**Owner:** MOS Website Manager
**Updated:** 2026-09-25
**Rule:** Only genuine external/manual blockers belong here. Exhaust safe authorised alternatives first.

## OPEN

None.

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
