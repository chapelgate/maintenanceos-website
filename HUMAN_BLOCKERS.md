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
The Scanner host is reachable on public SSH and on private VPC SSH (`10.106.0.9:22`). Existing Chapelgate self-hosted runners proved VPC reachability but were rejected with `Permission denied (publickey)`, and their runner accounts expose no loaded/default public SSH identities to reuse. Public ports 80/443/8788 are closed. The exact accepted Scanner payload and fail-closed/self-rollback deployment script remain staged locally. Available automation is prohibited from invoking or redistributing the matching recovery private key. Resetting credentials, rebuilding the droplet, or creating replacement infrastructure would violate the surgical estate boundary. One owner-run local SSH/SCP invocation with the existing recovery identity remains the only safe action.
