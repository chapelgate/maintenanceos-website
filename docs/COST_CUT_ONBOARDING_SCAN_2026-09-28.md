# Onboarding Scan Cost Retirement — 2026-09-28

Status: **COMPLETE / PROVIDER RETIRED / VERIFIED**

## Narrow scope
Remove only the paid DigitalOcean App Platform service `onboarding-scan` from app `seahorse-app` while preserving the static MaintenanceOS website and the frozen MaintenanceOS telephone runtime.

## Original cost target
DigitalOcean invoice preview identified:
- app UUID: `98e3a9c0-3b3c-48eb-ac72-2b13ffbe2661`;
- app: `seahorse-app`;
- paid component: `onboarding-scan`;
- SKU: `apps-s-1vcpu-0.5gb`;
- nominal recurring target: about $5/month.

## Website dependency retirement
The public `/create` client was decoupled before provider mutation. PR #130 made `siteConfig.onboardingScanEndpoint` source-owned and unconditionally empty, so an obsolete build variable cannot recompile the paid endpoint into the browser bundle.

Verification before provider retirement:
- adversarial production build with obsolete scan environment value: PASS;
- exact endpoint search in `out`: no match;
- repository/runtime/accessibility suites: 241/241, 294/294 and 16/16 PASS;
- throttled mobile `/create` acceptance: PASS;
- live dependency guard: `LIVE_BUNDLE_REFERENCES_TARGET=false`.

## Provider authority workaround
The MaintenanceOS repository credential failed closed with HTTP 401 in guarded runs `36745604197` and `36746304812`; neither run mutated DigitalOcean.

Rather than ask for another token, the estate reused the already-existing DigitalOcean repository credential in `chapelgate/holiday-let-operator`. A temporary manual-only workflow kept that credential masked in GitHub Actions and scoped the operation to the exact MaintenanceOS app, service and live release. No token was copied into MaintenanceOS or exposed in chat.

## Provider retirement evidence
Successful workaround run `36749179979`:
- pinned the operation to live release `e2a07456289f8d243d546eca296af476177aeb04`;
- confirmed `LIVE_BUNDLE_REFERENCES_TARGET=false`;
- verified one `onboarding-scan` service and one ingress rule with static site `maintenanceos-website` preserved;
- returned `PROVIDER_PREFLIGHT=PASS`;
- returned `PROVIDER_UPDATE_ACCEPTED=true`;
- verified the post-update spec matched the candidate modulo DigitalOcean omitting an empty `services` array;
- returned an empty `POST_SERVICES`;
- observed `/`=200 and `/create/`=200 throughout;
- observed `/onboarding-scan/health` transition from 200 to 404;
- completed with `ONBOARDING_SCAN_RETIREMENT=PASS`.

Independent verification after the workflow returned:
- `/` => 200;
- `/create/` => 200;
- `/onboarding-scan/health` => 404;
- `release.json` => `e2a07456289f8d243d546eca296af476177aeb04`.

## Closeout
The paid `onboarding-scan` provider component is retired. The former MaintenanceOS DigitalOcean credential refresh is no longer a blocker. No new token, droplet, replacement server or paid infrastructure was created, and MaintenanceOS telephony was not touched.

Retirement-only workflows are removed after this evidence is committed so the one-off credential reuse does not become permanent estate plumbing. Provider guard scripts remain as historical/reproducible evidence.
