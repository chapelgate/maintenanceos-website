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
The accepted Scanner V2 release still needs host access using the existing recovery identity before deployment/HTTPS verification can complete. Available automation cannot use the private recovery key and no authorised GitHub secret contains it. No replacement host or credential was created.
