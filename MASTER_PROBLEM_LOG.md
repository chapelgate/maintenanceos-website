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


## MOS-WEB-COMM-001 — Final create-step copy contradicted receipt-backed production behaviour
Status: FIXED / VERIFICATION PENDING
Opened: 2026-09-30

Problem:
The final /create explanatory copy stated that submission did not send email, while the production lead path now requires a durable receipt and a confirmation-email acknowledgement from the existing mail provider.

Root cause:
The functional mobile/durable-receipt repair was converged to main after the earlier stacked branch work, but one explanatory paragraph retained the pre-receipt wording.

Surgical fix:
- align the paragraph with the existing production behaviour;
- retain the explicit boundary that submission does not provision a number, place a test call, or activate a live agent;
- add a source regression assertion preventing the contradictory wording from returning.

Verification:
Pending branch release-gate execution. No telephony, provider, provisioning, pricing, legal, or launch-flag behaviour changed.


## MOS-WEB-CI-001 — Website repair verifier counted non-HTML routes as index.html
Status: FIXED / VERIFICATION PENDING
Opened: 2026-09-30

Problem:
The dedicated website integration repair workflow required 30 exported `index.html` files. The current Next.js static build correctly generates 30 routes, but only 28 are HTML/index routes; `robots.txt` and `sitemap.xml` are machine-readable non-HTML routes.

Evidence:
Independent Windows verification on exact branch SHA generated all 30 Next.js routes and 28 `index.html` files, then failed only at the incorrect route-count assertion.

Surgical fix:
Require exactly 28 exported `index.html` files and separately require `out/robots.txt` plus `out/sitemap.xml`. This preserves the intended 30-route coverage without weakening the gate.

Verification:
Pending rerun on the corrected branch. The earlier PowerShell `npm.ps1` execution-policy issue was bypassed with `npm.cmd`; it occurred before product execution and required no product change.
