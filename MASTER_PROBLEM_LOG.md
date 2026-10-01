# MaintenanceOS Website Master Problem Log

## MOS-WEB-COST-001 — Paid App Platform onboarding-scan provider component remains billable
Status: RESOLVED / VERIFIED
Opened: 2026-09-28
Resolved: 2026-09-30

Problem:
DigitalOcean App Platform service `onboarding-scan` inside `seahorse-app` was an approximately $5/month component that the public `/create` flow historically referenced.

Resolution:
The public website was first decoupled at source, then the provider component was retired without asking for another MaintenanceOS token. The estate reused the already-existing `holiday-let-operator` DigitalOcean repository credential through a temporary, manual-only, target-scoped workflow. The credential remained masked inside GitHub Actions and was not copied into MaintenanceOS or exposed to chat.

Verified evidence:
- PR #130 merged source-level retirement at `e8e7ce16c49435beb00c3516b122d64664a259f1`;
- adversarial production build with obsolete `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` deliberately set: PASS;
- exact `rg -F "onboarding-scan/v1/onboarding/scan" out`: no matches / expected exit code 1;
- full integrated suites: 241/241 repository tests, 294/294 runtime/package tests, 16/16 accessibility;
- throttled mobile `/create` acceptance: PASS at 390x844@3, 6x CPU throttle, 250 ms latency and 1.4 s JS delay;
- deployed MaintenanceOS release during retirement was exactly `e2a07456289f8d243d546eca296af476177aeb04`;
- live dependency guard reported `LIVE_BUNDLE_REFERENCES_TARGET=false`;
- earlier guarded MaintenanceOS runs `36745604197` and `36746304812` correctly failed closed on HTTP 401 before provider mutation;
- workaround run `36749179979` validated app ID/name, one target service, one target ingress rule and preserved static site `maintenanceos-website`;
- provider preflight passed and the DigitalOcean update was accepted;
- post-update spec matched the candidate modulo DigitalOcean omitting an empty `services` array, and `POST_SERVICES` was empty;
- post-change verification observed `/`=200, `/create/`=200 and `/onboarding-scan/health` transition from 200 to 404;
- independent verification after the workflow again returned `/`=200, `/create/`=200, `/onboarding-scan/health`=404 and release `e2a07456289f8d243d546eca296af476177aeb04`;
- no new token, droplet, replacement server or paid infrastructure was created, and MaintenanceOS telephony was not touched.

Closeout:
The former DigitalOcean credential refresh is no longer a human blocker. Temporary retirement-only workflows are removed after evidence is recorded so this one-off workaround does not become permanent estate plumbing.

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

## MOS-WEB-TEST-001 — Windows Edge teardown could false-fail successful mobile acceptance
Status: RESOLVED / VERIFIED
Opened: 2026-09-30

Problem:
The mobile browser acceptance completed the product journey successfully and emitted `ok: true`, but one Windows run exited 1 because the temporary Edge profile was still locked during teardown (`EPERM`). That could falsely classify a successful `/create` acceptance as a product failure.

Root cause:
The harness requested browser termination, waited a fixed 300 ms, then removed the profile. Edge can keep the profile locked briefly after the parent process is asked to exit.

Surgical test-only fix:
- wait for the spawned browser process to exit, bounded to 2 seconds;
- increase profile-removal retries to 10 with a 200 ms retry delay;
- do not change application, network, lead, scan, telephony, or provider behaviour.

Verification:
The repaired harness passed twice consecutively on the scan-retirement candidate, each with exit code 0, `ok=true`, `rawPosts=2`, `storedRequests=2`, `emailHandoffs=1`, `submissions=2`, 390x844@3 mobile emulation, 6x CPU throttle and 250 ms latency. The fix was then rebased cleanly onto current `main`.

## MOS-WEB-SEC-001 — Next.js production dependency lagged the current security patch
Status: RESOLVED / VERIFIED
Opened: 2026-09-30
Resolved: 2026-09-30

Problem:
Production was pinned to `next` and `eslint-config-next` 16.3.6 while stable 16.3.8 was published on 2026-09-30 during the current Next.js security-release window.

Surgical fix:
- update only `next` from 16.3.6 to 16.3.8;
- update the matched `eslint-config-next` package from 16.3.6 to 16.3.8;
- leave React, TypeScript, ESLint major version, Playwright, hosting, telephony and application behaviour unchanged.

Verification:
- npm install/audit: 0 vulnerabilities;
- source suite: 241/241 PASS;
- runtime/package suite: 294/294 PASS;
- accessibility: 16/16 PASS;
- lint: 0 errors after removing one independently confirmed dead import;
- production build: Next.js 16.3.8, TypeScript PASS, 30/30 static routes;
- Edge browser matrix: 18/18 PASS;
- Firefox/WebKit browser matrix: 36/36 PASS with 0 page errors and 0 console errors;
- adversarial retired-scan build: 0 endpoint matches;
- throttled mobile acceptance: PASS, 2/2 submissions, 2 stored requests and 1 email handoff.

## MOS-WEB-DEV-001 — Disposable verification worktree lost Git metadata
Status: RESOLVED / VERIFICATION WORKSPACE RECREATED
Opened: 2026-09-30
Resolved: 2026-09-30

Problem:
A disposable Next.js patch worktree later failed the release-marker preflight because its `.git` pointer referenced an earlier common checkout that had already been removed. `git rev-parse HEAD` reproduced the failure, so the build could not prove its source commit.

Resolution:
The damaged worktree was not repaired or trusted. A fresh clone of exact `main` SHA `2601ed0b57efe6af8aaf0f4ef491775b2762d46e` was created, the two-package patch was reapplied, and every release-quality gate was rerun from that valid checkout.

## MOS-WEB-LINT-001 — Conversion acceptance script retained an unused assert import
Status: RESOLVED / VERIFIED
Opened: 2026-09-30
Resolved: 2026-09-30

Problem:
ESLint reported one warning because `scripts/conversion-acceptance.mjs` imported `node:assert/strict` but never used it.

Surgical fix:
Remove only the dead import. No acceptance logic or runtime behaviour changed.

Verification:
Final lint rerun completed with 0 errors and 0 warnings; the full 241/241 + 294/294 repository suites also passed after the cleanup.


## MOS-WEB-CLAIMS-001 — Product claims checkpoint lagged current MaintenanceOS source
Status: RESOLVED / VERIFIED
Opened: 2026-09-30
Resolved: 2026-09-30

Problem:
The website claims register remained signed against product checkpoint
`cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8` from 2026-09-26 while canonical
`chapelgate/maintenanceos-v1-pilot` had advanced 30 commits to
`498ad82dd87631814195d447d89458480b117951`. Those commits include voice turn
recovery, provider adapter/webhook and call-notification changes plus current live
incident evidence, so the earlier checkpoint could not be treated as launch-current.

Evidence and resolution:
- exact product `main` pinned at `498ad82dd87631814195d447d89458480b117951`;
- diff from the prior claims checkpoint reviewed: 30 commits, with claim-bearing
  runtime changes concentrated in voice/provider/notification paths;
- current `MASTER_PROBLEM_LOG.md`, `HUMAN_BLOCKERS.md`, `README.md` and
  `STAGED_VOICE_INTEGRATION.md` reviewed;
- targeted current-product claims/safety suite: **196 passed / 0 failed** across
  explicit transfer, live-defect regression, voice-action claims, Gemini provider
  and policy, provider adapter/webhook contracts, webhook security, tenant
  isolation, lifecycle integrity, readiness, decision rules, invoice rules,
  state-machine controls and local acceptance;
- current live voice evidence explicitly records a greet-then-stall real-call
  defect on the accepted host; the narrow hotfix is verified but undeployed due
  to missing authorised host deployment identity;
- website voice/production status therefore remains **NO-GO / PRE-LAUNCH**;
- the retired public onboarding-scan path is no longer represented as a live or
  available website crawl capability;
- launch checklist, backlog claims checkpoint and external-blocker register were
  reconciled to the same current evidence;
- a source regression now checks that the claims register, launch checklist and
  backlog share the same product SHA and that voice NO-GO / scan-retirement
  boundaries remain explicit.

No public capability was promoted by this refresh.


## MOS-WEB-CLAIMS-002 — Retired public website crawl remained in customer-facing copy
Status: RESOLVED / VERIFIED
Opened: 2026-09-30
Resolved: 2026-09-30

Problem:
The paid/public onboarding-scan path had been safely retired, but several public
surfaces still described a website scan as configurable, queued or under test.
That created a claims inconsistency: source and provider state said no public
crawl, while Create, Demo, FAQ, Security, How It Works, privacy/terms drafts,
AI-readable summaries and product-tour copy could still imply one.

Root cause:
Provider retirement and source-level fail-closed work were completed before all
derived marketing/legal/SEO copy contracts were reconciled. Existing regression
tests then correctly exposed their own stale expectations for the former scan
state.

Surgical fix:
- define one public invariant: the submitted website URL is a setup hint; the
  current public site does not fetch or crawl submitted pages; missing business
  facts stay empty until reviewed or supplied;
- reconcile Create, Demo, FAQ/FAQPage, Security, How It Works, homepage,
  Features inventory/card, privacy/terms draft copy, llms.txt, llms-full.txt,
  product-tour captions/storyboard and comparison evidence to that invariant;
- leave dormant/non-public scan implementation code in place rather than
  deleting unrelated source capability;
- update existing truth-contract tests instead of re-enabling the retired crawl;
- keep product voice/commercial status conservative at current product checkpoint
  `498ad82dd87631814195d447d89458480b117951`.

Verification on exact application candidate
`700c9f233da0608c6ec7a68eca094405d4d17b69`:
- current-product targeted claims/safety suite: **196/196 PASS** at product SHA
  `498ad82dd87631814195d447d89458480b117951`;
- website source/script suite: **242/242 PASS**;
- website runtime/package suite: **294/294 PASS**;
- accessibility: **16/16 PASS**;
- ESLint: PASS;
- Next.js **16.3.8** production static build: PASS;
- dependency audit at moderate threshold: PASS;
- adversarial build deliberately supplied the obsolete
  `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`; exact retired endpoint search in
  exported `out/`: **0 matches**;
- exported stale-claim search for former SSRF-safe/configurable/queued scan
  wording: **0 matches**;
- real Microsoft Edge viewport matrix: **18/18 PASS** across
  mobile/tablet/desktop;
- Firefox/WebKit cross-engine matrix: **36/36 PASS**, 0 page errors and 0 console errors;
- throttled mobile `/create` acceptance: PASS at 390x844@3, 6x CPU throttle,
  250 ms latency and 1.4 s JS delay;
- durable lead evidence: 2 raw posts, 2 stored requests, 2 submissions and
  1 email handoff;
- `git diff --check`: PASS.

No telephony, provider routing, pricing, public-launch flag or paid
infrastructure was changed by this repair.

## MOS-WEB-CREATE-002 ? /create ended in email instead of an interactive receptionist preview
Status: RESOLVED / VERIFIED LIVE
Opened: 2026-09-30
Resolved: 2026-09-30

Problem:
A real user acceptance test showed that completing `/create` led primarily to a saved early-access request and confirmation email. The expected product journey was to configure the receptionist and then immediately interact with it in a call-style test surface. Public pages also exposed engineering language such as "sandbox" and "under test" that made a working preview look unfinished.

Root cause:
The public funnel had been designed around early-access lead capture. A deterministic pack-aware conversation engine already existed, but its browser demo was hidden behind the sandbox feature flag and exposed only a fixed scripted transcript. The final primary action therefore submitted the lead instead of demonstrating the configured receptionist.

Surgical fix:
- reuse the existing deterministic `scriptedReply` conversation engine; no new AI provider, service, droplet or telephony route;
- expose a public browser-only `Try your receptionist` interaction after configuration, with typed caller questions and pack-aware replies;
- make `Save setup & email reference` a separate secondary action so trying the receptionist does not send an email;
- keep live telephony completely isolated and continue to state that the browser preview does not dial a number;
- require both the engineering sandbox flag and a configured hosted companion endpoint before sandbox qualification can gate a saved setup, so the public browser demo can never award `sandbox_passed` or unlock provisioning;
- code-split the interactive demo so `/create` retains its performance boundary;
- replace customer-visible "UNDER TEST" / "sandbox" language with `PREVIEW` / plain customer wording while retaining internal evidence status identifiers;
- retire the obsolete public coming-soon sandbox component and update the existing mobile browser acceptance test to exercise the real interactive path.

Verification candidate evidence:
- complete repository source tests: PASS;
- runtime/package/library tests: 294/294 PASS;
- accessibility: 16/16 PASS;
- TypeScript: PASS;
- ESLint across `src`, `scripts`, and `packages`: PASS;
- Next.js 16.3.8 production build: PASS, 30/30 static routes, 28 HTML pages plus robots/sitemap;
- Edge browser viewport matrix: 18/18 PASS across mobile/tablet/desktop and six critical routes;
- mobile real-browser `/create` acceptance at 390x844@3: PASS;
- acceptance proved primary action `Try your receptionist`, successful caller question `What services do you offer?`, pack-aware reply containing configured Alley Gate services, zero lead/email requests before optional Save, and zero runtime exceptions;
- rendered visible-text audit across exported HTML: 0 visitor-visible occurrences of `under test`, `under testing`, or `sandbox`;
- `git diff --check`: PASS;
- live telephony, carrier routing, provisioning adapters and provider credentials were not modified.

Live release verification:
- PR #139 merged exact verified head cbf07ffff47ed327d9b0ea63fbb9910002142c75 into main as 358027a9d76ffd05d9686384c55a17220176ce5b;
- DigitalOcean App Platform native auto-deploy converged to release marker 358027a9d76ffd05d9686384c55a17220176ce5b, built 2026-09-30T20:08:12.798Z;
- live / and /create/ both returned HTTP 200;
- live Edge mobile acceptance on the public URL passed: Try your receptionist, caller question What services do you offer?, pack-aware answer, 0 production lead/email requests before optional Save, 0 runtime exceptions;
- live sitemap audit covered 26 public URLs with 0 visitor-visible under test, under testing, or sandbox wording;
- all 7 scripts referenced by live /create/ were checked and contained 0 references to the retired onboarding-scan/v1/onboarding/scan endpoint.

Cross-engine note:
The pre-existing Firefox/WebKit smoke runner did not return a fresh result on the authorised Windows verifier during this candidate run and had no active browser child when inspected. This was treated as a verifier-environment issue, not product evidence. The prior frozen cross-engine baseline remains green; the release-critical current change is additionally covered by the successful real Edge mobile interactive acceptance and Edge 18/18 viewport matrix.


## MOS-WEB-CREATE-003 — Restored website learning and browser voice preview required live convergence proof
Status: RESOLVED / VERIFIED LIVE
Opened: 2026-10-01
Resolved: 2026-10-01

Problem:
After the interactive /create release was frozen, later intentional work restored on-demand website learning through the same-origin DigitalOcean Function and repaired its production route. The combined production journey therefore needed a fresh black-box proof that website learning, review, receptionist generation, and browser voice interaction still converged together without reintroducing customer-facing engineering language, lead side effects, or telephony changes.

Verification on exact live application SHA `ef3697eb285092b7db360cb54939d156e5e8461d`:
- live `/release.json` matched that exact `main` SHA;
- live `/create/` returned HTTP 200;
- visitor-visible text audit found 0 occurrences of `sandbox`, `under test`, or `under testing`;
- same-origin `POST /api/website/scan` against `https://example.com` returned HTTP 200 with `Example Domain` plus source/confidence provenance;
- a target-specific `https://alleygates.co.uk` scan returned fail-closed HTTP 422 with `http_401`; a second public target succeeded, proving the scanner service itself was available and the Alley Gates result was a remote-site refusal rather than scanner outage;
- real Microsoft Edge headless mobile acceptance at 390x844@3 completed website learning -> role selection -> reviewed configuration -> `Try your receptionist` -> `Start voice call`;
- deterministic browser speech QA asked `What services do you offer?`;
- the spoken and transcript replies both used the reviewed `Boiler repairs` / `Emergency plumbing` service data;
- production lead/email requests before optional Save: 0;
- runtime exceptions: 0;
- live telephone service, carrier routing, provisioning adapters, and provider credentials were not modified.

Debugging/reuse decision:
The existing reviewed CDP acceptance harness was reused for the live black-box run instead of adding a duplicate browser-testing stack. No new service, runner, paid model, package, or infrastructure was introduced.

Freeze:
This evidence record is merged through normal PR change control. After the record-only merge is published by the existing DigitalOcean native auto-deploy path, the exact deployed merge SHA must be rechecked and the live black-box acceptance rerun before creating freeze tag `maintenanceos-website-create-scan-voice-live-20261001`.

Evidence: `docs/CREATE_LIVE_BLACKBOX_2026-10-01.md`.

## MOS-WEB-CREATE-004 — Website knowledge scan can fail on one CDN edge and empty the receptionist pack
Status: FIX CANDIDATE / NOT YET LIVE VERIFIED
Opened: 2026-10-01

Problem:
A real iPhone /create test against Alley Gates produced a greeting but no usable website-derived knowledge. Questions about the company, services and keys fell through to the generic "not on file" response.

Root cause evidence:
- PR #144 had previously verified the prebuilt scanner extracting Alley Gates, installation, CCTV, security fencing and keys.
- PR #148 repaired address failover and natural browser-preview questions, but the user's post-deploy iPhone test still failed at Step 2 before a knowledge pack existed.
- the exact live release marker was confirmed as PR #148 merge SHA `0fcfcfa7d4fed2d3b6700c8f59d8a8654b8bd62c`;
- live `/api/website/scan` returned HTTP 200 for `https://example.com/` but HTTP 422 for every tested Alley Gates path with `robots_unavailable` + `http_401`;
- homepage, robots.txt, wp-sitemap.xml, wp-json and www all failed identically only through DigitalOcean Functions egress;
- the same Alley Gates homepage and robots.txt returned HTTP 200 from a clean external runner using the scanner user-agent, proving the public site and scanner identity were valid;
- Alley Gates' public WordPress REST endpoint explicitly returned CORS permission for the MaintenanceOS production origin and exposed 19 public pages containing Alley Gate Installation, CCTV, Security Fencing and key-order information.
The remaining defect is therefore provider-path-specific fetch refusal between DigitalOcean Functions and the Alley Gates StackCDN/StackProtect path, not missing website content or a broken /create deployment.

Surgical fix:
- keep the existing DigitalOcean Function as the primary scanner and preserve all URL/DNS/SSRF, redirect, robot, size and timeout controls;
- invoke a browser WordPress REST fallback only after the primary scanner returns the exact already-validated `422 fetch_failed` condition;
- browser fallback is same-site only, HTTPS only, CORS-authorised, credential-free, bounded to 20 public pages / bounded JSON sizes / a fixed timeout, and never proxies or bypasses access controls;
- reuse the existing deterministic extractor for untrusted public content;
- derive services only from explicit public business-page titles while excluding account/cart/policy/generic pages;
- copy key-order guidance only when explicit public key/order/delivery text exists, with the online shop URL only when that same-origin public link is present;
- retain the PR #148 natural browser-preview matching so customer questions can use the recovered reviewed facts.

Hard boundary:
Website scanner and browser preview only. Do not modify, exercise, reroute or redeploy MaintenanceOS production telephony, carrier routing, live numbers, provider credentials or the golden phone line.

Verification required before RESOLVED:
repository tests, TypeScript/build guards, PR validation, merge, DigitalOcean deployment identity, live Alley Gates scan returning useful website-derived fields, then a real /create browser question whose reply comes from that scanned knowledge.

