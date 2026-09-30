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
Status: RESOLVED / VERIFIED
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
Independent verification on branch candidate `ddfb93ac6eb74076622b436b2a2c6f2ffac0a6e1` passed:
- repository test suites: 238/238 source-script tests plus 294/294 package/runtime/source tests;
- accessibility gate: 15/15;
- ESLint on the touched runtime path: PASS;
- TypeScript `--noEmit`: PASS;
- Next.js 16.3.6 production build: PASS, 30/30 routes generated;
- exported route shape: 28 HTML/index routes + `robots.txt` + `sitemap.xml`;
- Edge real-browser viewport smoke: PASS across mobile/tablet/desktop route matrix;
- throttled mobile create acceptance: PASS at 390x844@3, 6x CPU throttle, 250 ms network latency and 1.4 s JS delay;
- duplicate-submit/idempotency evidence: 2 raw posts -> 2 stored requests, no duplicate store;
- receipt/email-hand-off paths exercised, including one intentionally degraded mail handoff;
- `git diff --check`: PASS.

No telephony, provider, provisioning, pricing, legal, or public-launch behaviour changed.


## MOS-WEB-CI-001 — Website repair verifier counted non-HTML routes as index.html
Status: RESOLVED / VERIFIED
Opened: 2026-09-30

Problem:
The dedicated website integration repair workflow required 30 exported `index.html` files. The current Next.js static build correctly generates 30 routes, but only 28 are HTML/index routes; `robots.txt` and `sitemap.xml` are machine-readable non-HTML routes.

Evidence:
Independent Windows verification on exact branch SHA generated all 30 Next.js routes and 28 `index.html` files, then failed only at the incorrect route-count assertion.

Surgical fix:
Require exactly 28 exported `index.html` files and separately require `out/robots.txt` plus `out/sitemap.xml`. This preserves the intended 30-route coverage without weakening the gate.

Verification:
The corrected route-shape assertion passed in independent verification: exactly 28 exported `index.html` files plus `out/robots.txt` and `out/sitemap.xml`, matching the 30 routes reported by Next.js. The complete browser/mobile acceptance sequence then passed. The earlier PowerShell `npm.ps1` execution-policy issue was bypassed with `npm.cmd`; it occurred before product execution and required no product change.


## MOS-WEB-CI-002 — DigitalOcean deploy workflow was pinned to an obsolete source SHA
Status: FIXED / DEPLOYMENT VERIFICATION PENDING
Opened: 2026-09-30

Problem:
The existing manual DigitalOcean App Platform deployment workflow was hard-pinned to website source SHA `34823a6f71528e2c5da834b93125cb36427a07ff`. After the verified commercial-create repair merged to `main`, the live static host remained on older SHA `77524c5082a77c094bf966843e71480f273d4c5f`, and the deployment workflow could not safely deploy the current reviewed source.

Root cause:
The Step-5 deployment workflow was implemented as a one-off exact-SHA guard rather than a reusable exact-SHA deployment gate.

Surgical fix:
- require an explicit `expected_source_sha` workflow-dispatch input;
- fail closed unless the workflow is dispatched against `main` and checked-out HEAD exactly equals that SHA;
- reuse the existing DigitalOcean App Platform app and existing repository secret only;
- after deployment, require live `release.json` to equal the authorised SHA;
- retain the public `/create` non-native-form acceptance check.

No new app, droplet, credential, hosting provider, or deployment path was created.

Verification:
Workflow source reviewed and repository diff will be checked before merge. Final closure requires a successful dispatch against the merged exact SHA and independent live readback of `release.json`.
