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
Status: RESOLVED / LIVE DEPLOY VERIFIED
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
- workflow-only repair diff passed `git diff --check` and was merged as `e3d3b03f7c90d9fa3f2c59009cdccfc4b0506df3`;
- the manual workflow dispatch for that exact SHA did not start because GitHub reported an Actions-budget block before any workflow step executed;
- the existing DigitalOcean App Platform native auto-deploy path independently rebuilt from `main`;
- cache-bypassed live `release.json` then reported exact commit `e3d3b03f7c90d9fa3f2c59009cdccfc4b0506df3` with build time `2026-09-30T14:44:14.451Z`;
- live `/create/` retained the expected "Check this website" journey and no native `<form>` regression.

The current release therefore deployed through the existing native App Platform path. The exact-SHA manual workflow remains a guarded fallback when hosted Actions execution is available.


## MOS-WEB-CI-003 — GitHub-hosted Actions budget blocks manual deployment fallback
Status: RECORDED / NON-BLOCKING TO CURRENT RELEASE
Opened: 2026-09-30

Problem:
Manual deployment run `36731230936` for exact source `e3d3b03f7c90d9fa3f2c59009cdccfc4b0506df3` failed before any job step started. GitHub check annotation: "The job was not started because an Actions budget is preventing further use."

Impact:
The hosted-runner manual force-rebuild fallback cannot currently execute. No product test or DigitalOcean API step failed, and no secret was exposed.

Current-release resolution:
The existing DigitalOcean App Platform native auto-deploy path remained operational and deployed the exact same `main` SHA, independently verified through live `release.json`. Therefore this quota condition does not block the current website release.

Future handling:
Do not spend or add infrastructure merely to silence this condition. If a future release genuinely requires manual force rebuild while hosted Actions remain unavailable, reuse an authorised trusted self-hosted execution path or restore Actions budget through normal account administration.

## MOS-WEB-QA-001 — Browser QA covered only Edge/Chromium
Status: RESOLVED / VERIFIED
Opened: 2026-09-30

Problem:
The durable browser gate exercised Microsoft Edge only. The backlog therefore
could not close the autonomous portion of broader browser-engine QA.

Surgical fix:
- add Playwright 1.63.0 as a pinned dev-only dependency;
- add Firefox 155.0 and WebKit 26.6 smoke coverage for the same six critical
  routes and 390/768/1440 viewport classes;
- capture page errors, console errors, horizontal overflow, route structure,
  `/create/` non-native-form behaviour, JSON results and failure screenshots;
- retain the existing Edge CDP gate instead of replacing working coverage.

Verification:
Edge 18/18 PASS; Firefox/WebKit 36/36 PASS; zero cross-engine failures.
Evidence: `docs/CROSS_ENGINE_BROWSER_QA_2026-09-30.md`.

## MOS-WEB-QA-002 — Local browser smoke could emit production measurement traffic
Status: RESOLVED / VERIFIED
Opened: 2026-09-30

Problem:
The local exported-site browser build contains the production cookieless
measurement endpoint by default. Initial WebKit QA exposed localhost CORS
rejections and showed that browser smoke could create test measurement traffic.

Root cause:
Browser QA isolated the website files but did not isolate the outbound bounded
measurement request.

Surgical fix:
- Playwright fulfils only the website-events request with a synthetic local 202;
- Edge CDP blocks only `*/v1/public/website-events`;
- production lead submission is not intercepted or exercised;
- source tests lock both isolation controls.

Verification:
Corrected Firefox/WebKit matrix reports 0 page errors and 0 console errors;
all 36 checks pass. Existing Edge matrix remains 18/18 PASS.

## MOS-WEB-PERF-001 — Current main exceeded the existing /create release budget
Status: RESOLVED / VERIFIED
Opened: 2026-09-30

Problem:
Fresh-clone release preflight on current `main` SHA `a11a55b170f9832d5ea3013cce47fe1a7279df33` failed the unchanged performance gate. `/create/` measured 628 KB raw initial first-party JavaScript and 191 KB gzip against the existing 600 KB / 190 KB limits.

Root-cause evidence:
The same failure reproduced on an untouched fresh clone of `main`, proving the new Playwright QA dependency was not the cause. Repository history showed that later create steps had previously been code-split, but the boundary was removed during the September 28 mobile convergence. The documented mobile root cause was native form navigation before hydration; the current entry step already removes the native form and disables its action until hydration.

Surgical fix:
- restore only the `CreateReceptionistLaterSteps` dynamic boundary;
- retain the current hydration-safe non-native Step 1 and all current mobile safeguards;
- provide a bounded Step-2 loading fallback that keeps the visitor on `/create/`;
- update the performance regression to require the split and the hydration protections together;
- do not raise either performance budget.

Verification:
- `/create/` initial JS reduced from 628 KB raw / 191 KB gzip to 567 KB raw / 174 KB gzip;
- unchanged 600 KB raw / 190 KB gzip release budgets PASS;
- source/accessibility regressions for the create entry PASS;
- the original real-browser mobile stability acceptance passed at 390x844@3, 6x CPU throttle, 250 ms latency and 1.4 s JS delay;
- acceptance preserved same-page navigation, durable/idempotent submissions and the degraded-email path.

This repair changes loading boundaries only. It does not change telephony, provisioning, lead semantics, launch flags or hosting topology.

## MOS-WEB-COST-002 — Provider build variable could reintroduce paid onboarding-scan dependency
Status: RESOLVED / VERIFIED
Opened: 2026-09-30

Problem:
Although source supported an empty-endpoint queued fallback, `siteConfig.onboardingScanEndpoint` still read `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`. A provider-level build variable could therefore continue compiling the paid App Platform onboarding-scan URL into the public browser bundle.

Root cause:
Cost retirement depended on mutable provider configuration instead of a source-level fail-closed boundary.

Surgical fix:
- make the public client onboarding scan endpoint unconditionally empty;
- preserve the existing claims-safe queued early-access path;
- add a source regression test proving `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` cannot be compiled into the public client through site config.

Scope:
No telephony, lead receipt, pricing, legal, provisioning, public-launch, or customer-data behaviour changed. This intentionally removes only the live website-crawl request from the public client.
Verification (integrated branch `ea0d961aa3de3697a41d50fe61ce947a251b0cab`):
- current `main` `c6de587e1d25b98c6851510fec8c92a5c221e159` was integrated before final verification; the only merge conflict was this master problem log and both records were preserved;
- dependency install completed with 0 vulnerabilities;
- full repository source suite: 241/241 PASS;
- runtime/package suite: 294/294 PASS;
- adversarial production build with obsolete `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=https://seahorse-app-4oasq.ondigitalocean.app/onboarding-scan/v1/onboarding/scan` intentionally set: PASS on Next.js 16.3.6, TypeScript PASS, 30/30 static routes generated;
- exact `rg -F "onboarding-scan/v1/onboarding/scan" out` proof: no matches, expected rg exit code 1;
- mobile `/create` acceptance on the same export with the documented local test lead receiver override: PASS at 390x844@3, 6x CPU throttle, 250 ms network latency and 1.4 s JS delay; `rawPosts=2`, `storedRequests=2`, `emailHandoffs=1`;
- `git diff --check`: PASS.

Verification diagnostic note:
The first integrated mobile rerun used an export built without the harness-only `NEXT_PUBLIC_FORM_ENDPOINT=http://127.0.0.1:8787/leads` override. Instrumentation proved the UI correctly reported `Network error`, the local receiver saw `rawPosts=0`, and no runtime exception occurred. Rebuilding with the documented local receiver override made the unchanged application test pass. No application fix was required for that verification-environment error.
