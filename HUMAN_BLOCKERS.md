# MaintenanceOS Website Human Blockers

Resolved blockers are retained in `MASTER_PROBLEM_LOG.md`. This file lists only current human actions.

## HB-002 — Physical Safari/iOS and manual assistive-technology launch QA

## HB-003 — Live browser receptionist services missing due to stale scan pack
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

Required human action:
- Reproduce the services missing scenario by accessing the live /create page on a real iPhone device and ensuring the correct scan pack is used.
- Verify that the receptionist preview displays the complete list of services from the scan.
- Record any discrepancies and provide screenshots.
- Submit findings for engineering review a.out of an HTML root tests are expected.

Evidence: None yet; to be added once reproduction is done.
Evidence: `docs/CROSS_ENGINE_BROWSER_QA_2026-09-30.md`.
