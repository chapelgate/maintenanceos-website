# MaintenanceOS Website Human Blockers

Resolved blockers are retained in `MASTER_PROBLEM_LOG.md`. This file lists only current human actions.

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

[executed on device: CG (72ec1dc1-79ea-4c2f-824f-f0ea86ff67b6)]

## HB-003 — Scanner V2 production runtime designation
Status: RESOLVED
Date resolved: 2026-10-05

Resolution:
A dedicated DigitalOcean runtime now exists: `maintenanceos-scanner-v2` (droplet 606110383, 178.128.171.45). The prior runtime-designation blocker is obsolete.

Remaining human-only boundary:
The exact accepted current payload is staged locally as `maintenanceos-scanner-v2-cadce5c.tar.gz` with SHA-256 `46f6600a6f02ec034a05d8263ede89dc54dd8d33ca45d4fac4828f8c44bedf09`, together with a fail-closed/self-rollback deployment script. Available automation is prohibited from invoking the private recovery key. One local owner-run SSH/SCP command is therefore required to transfer and execute the staged package. No replacement host, credential, service, queue, database or router was created.
