# MaintenanceOS Website Master Problem Log

## MOS-WEB-COST-001 — Paid App Platform onboarding-scan cannot yet be retired safely
Status: BLOCKED / SAFE MUTATION PATH PREPARED
Opened: 2026-09-28

Problem:
DigitalOcean App Platform service `onboarding-scan` carries a recurring $5/month target cost inside `seahorse-app`.

Root cause / safety finding:
The live static `/create` bundle currently calls the paid service directly at
`https://seahorse-app-4oasq.ondigitalocean.app/onboarding-scan/v1/onboarding/scan`.
Deleting the component before removing that compiled dependency would regress the website scan flow.

Completed independent work:
- verified live static and service routes;
- verified the paid component from the DigitalOcean invoice;
- verified frozen MaintenanceOS telephony is outside this App Platform component;
- exhausted current DigitalOcean connector, local CLI/config, GitHub-secret and plugin-control paths;
- added fail-closed component-retirement tooling and regression tests;
- documented the exact safe cutover order.

Evidence: `docs/COST_CUT_ONBOARDING_SCAN_2026-09-28.md`.
