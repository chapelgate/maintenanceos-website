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
Status: OPEN ENGINEERING HUMAN GATE
Date: 2026-10-04

Exact blocker:
Scanner V2 has passed deterministic, real-site, JS-heavy, mobile deep-question and unsupported-question acceptance, but no existing approved Chapelgate runtime satisfies the remaining resumable production requirement without violating estate boundaries.

Rejected reuse paths:
- MaintenanceOS golden voice/USH/rollback hosts — explicitly out of scope;
- DigitalOcean estate runner, worker fleet and Evolution Engine — control/engineering infrastructure, not product serving;
- unrelated product droplets — cross-project production coupling;
- Railway rsfm-control-plane — unrelated Python control plane/database;
- Railway generic runtime services — no proven live durable state/public serving path; one is failed and one is cron-only;
- Render — prohibited estate-wide.

Required human action:
- explicitly approve/designate an existing persistent runtime for Scanner V2, or authorise one minimal new persistent runtime/storage path.

Until then S008B remains HOLD. V1 stays the production rollback path and the golden phone line remains untouched.
