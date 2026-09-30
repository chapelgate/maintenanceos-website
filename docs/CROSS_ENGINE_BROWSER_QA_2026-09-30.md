# Cross-engine browser QA — 2026-09-30

Status: ENGINEERING PASS / PHYSICAL SAFARI-iOS + MANUAL AT REMAIN

## Scope

This gate extends the existing Microsoft Edge viewport smoke without replacing it.
It exercises six buyer-critical static-export routes:

- `/`
- `/create/`
- `/demo/`
- `/features/`
- `/pricing/`
- `/security/`

Each route is checked at 390×844, 768×1024 and 1440×900.
## Browser engines

- Microsoft Edge 154.0.4258.37 — existing zero-dependency CDP gate.
- Playwright Firefox 155.0.
- Playwright WebKit 26.6.
- Playwright package is pinned as a devDependency at 1.63.0.
- Production dependencies and the deployed browser bundle are unchanged.

The WebKit build is useful engine coverage but is not represented as a substitute
for physical Safari/iOS hardware testing.
## Automated assertions

The Edge gate checks route rendering, H1 presence, focusable controls, Create CTA
presence and horizontal overflow.

The Firefox/WebKit gate adds:

- HTTP success;
- the same route/layout/focus checks;
- `/create/` non-native-form and "Check this website" assertions;
- uncaught page error capture;
- console error capture;
- JSON evidence at `.browser-cross-engine/latest.json`;
- full-page screenshots for any failing route.
## Test isolation repair

Initial WebKit execution correctly exposed that a local static-export origin was
attempting cookieless measurement against the production Railway endpoint. The
production endpoint rejects localhost CORS, producing browser errors and risking
test-generated measurement noise.

The QA harness was corrected rather than weakening product CORS:

- Playwright fulfils only `**/v1/public/website-events` locally with a synthetic
  202 response;
- the existing Edge CDP smoke blocks that same measurement URL;
- no production lead route is intercepted or submitted;
- source regression tests lock this isolation behaviour.
## Verification result

- Existing Edge matrix: 18/18 route/viewport checks PASS.
- Firefox + WebKit matrix: 36/36 route/engine/viewport checks PASS.
- Firefox/WebKit page errors: 0.
- Firefox/WebKit console errors: 0.
- Horizontal overflow failures: 0.
- `/create/` native-form regressions: 0.
- npm audit at high threshold: 0 vulnerabilities.
- `git diff --check`: PASS.

Total automated browser coverage for this gate: 54 checks.
## Remaining human launch coverage

Engineering automation is complete for the available browser engines. Public
launch still requires the human QA already tracked elsewhere:

- physical Safari on supported Apple hardware;
- physical iOS Safari at a representative phone width;
- manual keyboard navigation;
- manual assistive-technology review;
- any defects found there fixed and re-verified.

No new hosting service, testing SaaS, production endpoint, telephony path or
runtime dependency was created.
